from flask import request
from apifairy import authenticate
from sqlalchemy.orm import joinedload
from sqlalchemy import desc, or_, asc
import datetime

from app import app
from models import User, Submission, LeagueRun
from routes.helpers import (ito_api_response, get_single_entry, get_all_list, update_submission_rankings, \
                            update_player_scores, convert_time_to_int, organize_submissions, get_user_categories, \
                            categories_to_bits, extract_time_components, get_first_place_run, notify_discord_bot, \
                            convert_int_to_time, update_league_rankings)
from routes.auth_routes import token_auth
from session import db_session

@app.route('/api/users/create', methods=['POST'])
@db_session
def create_account(session):
    try:
        data = request.get_json()

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return ito_api_response(success=False, message='Missing required fields', status_code=400)

        existing_account = session.query(User).filter(
            or_(User.username == username, User.email == email.lower())
        ).first()

        if existing_account:
            return ito_api_response(success=False, message='Username or Email already used', status_code=400)

        new_account = User(username=username, email=email.lower(), creation_date=datetime.datetime.now(), score=0, role=0, lb_pref=3, flag='us')
        new_account.generate_password_hash(password)

        session.add(new_account)
        session.commit()

        data = get_single_entry(new_account)

        return ito_api_response(success=True, data=data, message='Account created successfully', status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/me/edit', methods=['POST'])
@db_session
@authenticate(token_auth)
def edit_account(session):

    curr_user = token_auth.current_user()

    user_pointer = session.query(User).filter_by(id=curr_user.id).first()

    data = request.get_json()

    print(data)

    if "categories" in data:
        user_pointer.lb_pref = categories_to_bits(data['categories'])
    if "password" in data:
        user_pointer.generate_password_hash(data['password'])
    if "flag" in data:
        user_pointer.flag = data['flag']
    if "username" in data:
        user_pointer.username = data['username']
    if "username_color" in data:
        user_pointer.username_color = data['username_color']

    return_data = get_single_entry(user_pointer)

    return_data['categories'] = get_user_categories(return_data['lb_pref'])
    return_data.pop('password')

    session.commit()

    return ito_api_response(success=True, data=return_data, message='Account edited successfully', status_code=200)


@app.route('/api/me', methods=['GET'])
@authenticate(token_auth)
def get_me():

    try:

        user = token_auth.current_user()

        data = get_single_entry(user)

        data['categories'] = get_user_categories(data['lb_pref'])
        data.pop('password')

        return ito_api_response(success=True, data=data, message='Account retrieved successfully', status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/profile/<username>', methods=['GET'])
@db_session
def profile_page(session, username):
    try:

        # Need to order the submissions by date
        user = (
            session.query(User)
            .filter(User.username == username)
            .first()
        )

        if not user:
            return ito_api_response(success=False, message='User not found', status_code=404)

        users_query = (
            session.query(User)
            .order_by(desc(User.score))
        )

        # Handle regular submissions
        if user.submissions:
            sorted_submissions = sorted(
                [sub for sub in user.submissions if not sub.voided],
                key=lambda x: x.date,
                reverse=True
            )
        else:
            sorted_submissions = []

        # Handle league runs
        league_runs = (
            session.query(LeagueRun)
            .filter(LeagueRun.user_id == user.id)
            .order_by(desc(LeagueRun.date))
            .all()
        )

        user_rank = 0
        for index, ranked_user in enumerate(users_query):
            if ranked_user.username == username:
                user_rank = index + 1
                break

        data = get_single_entry(user)

        # Regular submissions data
        if user.submissions:
            data['submissions'] = get_all_list(sorted_submissions)
            data['total_runs'] = len(user.submissions)
            data['runs'] = len([submission for submission in user.submissions if not submission.voided])
        else:
            data['submissions'] = []
            data['total_runs'] = 0
            data['runs'] = 0

        # League runs data
        if league_runs:
            data['league_runs'] = get_all_list(league_runs)
            data['total_league_runs'] = len(league_runs)
        else:
            data['league_runs'] = []
            data['total_league_runs'] = 0

        data['rank'] = user_rank
        data['ordered_submissions'], data['chapter_scores'] = organize_submissions(data['submissions'])
        data.pop('password')

        return ito_api_response(success=True, data=data, message='Account profile page retrieved', status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/me/background_color', methods=['POST'])
@authenticate(token_auth)
@db_session
def set_background_color(session):

    try:

        auth_user = token_auth.current_user()

        # current_user() does not return a pointer to user object so you cant edit anything
        current_user = session.query(User).filter(User.id == auth_user.id).first()

        data = request.get_json()
        color = data.get('background_color')

        current_user.background_page_color = color

        session.commit()

        return ito_api_response(success=True, message='Background color successfully changed', status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/submission/create', methods=['POST'])
@authenticate(token_auth)
@db_session
def create_submission(session):

    try:

        curr_user = token_auth.current_user()

        if curr_user.role <= 0:
            return ito_api_response(success=False, message="You're account has not been verified yet", status_code=403)

        data = request.get_json()

        print(data)

        date = data.get('submissionDate')
        chapter = data.get('chapter').lower()
        sub_chapter = data.get('sub_chapter').lower()
        video_url = data.get('video_url')
        category = data.get('category').lower()
        time_minutes = data.get('minutes')
        time_seconds = data.get('seconds')
        time_milliseconds = data.get('milliseconds')
        description = data.get('description')

        if (not chapter or not sub_chapter or not video_url or not category
             or time_seconds is None or time_milliseconds is None or time_minutes is None):
            print(chapter, sub_chapter, video_url, category, time_seconds, time_milliseconds, time_minutes)
            return ito_api_response(success=False, message='Missing required fields', status_code=400)


        game_title = "itt"

        if date is None:
            date = datetime.datetime.now()
        else:
            parsed_date = datetime.datetime.strptime(date, "%Y-%m-%d")
            current_date = datetime.datetime.now()
            if parsed_date.date() == current_date.date():
                date = current_date
            else:
                date = parsed_date

        # Need to set this before checking for a prev submission as that would void it and remove from lookup
        first_place_before = get_first_place_run(session, category, chapter, sub_chapter)

        check_existing_submission = (
            session.query(Submission)
            .filter(Submission.category == category, Submission.chapter == chapter, Submission.sub_chapter == sub_chapter,
                    Submission.user_id == curr_user.id)
            .all()
        )

        # This should handle multiple submissions from one player for a single subchapter
        for submission in check_existing_submission:
            submission.voided = True


        time_int = convert_time_to_int(time_milliseconds + "0", time_seconds, time_minutes)


        new_user_submission = Submission(date=date, game_title=game_title, chapter=chapter,
                                         sub_chapter=sub_chapter, video_url=video_url, time_complete=time_int,
                                         category=category, user_id=curr_user.id, voided=False, reported=False,
                                         description=description)

        session.add(new_user_submission)
        session.commit()

        update_submission_rankings(session, category, chapter, sub_chapter)
        update_player_scores(session)

        first_place_after = get_first_place_run(session, category, chapter, sub_chapter)

        print(first_place_after, first_place_before)

        if first_place_before is None:
            record_data = {
                'username': curr_user.username,
                'chapter': chapter,
                'sub_chapter': sub_chapter,
                'category': category,
                'time_complete': convert_int_to_time(first_place_after.time_complete),
                'video_url': first_place_after.video_url,
                'previous_record_time': None,
                'improvement_ms': None
            }

            print(f"Notifying Discord of first time record: {record_data}")

            # Send notification to Discord bot via webhook
            notify_discord_bot(record_data)
        elif first_place_after.id != first_place_before.id:
            record_data = {
                'username': curr_user.username,
                'chapter': chapter,
                'sub_chapter': sub_chapter,
                'category': category,
                'time_complete': convert_int_to_time(first_place_after.time_complete),
                'video_url': first_place_after.video_url,
                'previous_record_time': convert_int_to_time(first_place_before.time_complete),
                'improvement_ms': first_place_before.time_complete - first_place_after.time_complete
            }

            print(f"Notifying Discord of new record: {record_data}")

            # Send notification to Discord bot via webhook
            notify_discord_bot(record_data)

        return ito_api_response(success=True, data=get_single_entry(new_user_submission), message='Submission created',
                                status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/submission/update', methods=['POST'])
@authenticate(token_auth)
@db_session
def edit_existing_submission(session):

    try:

        curr_user = token_auth.current_user()

        data = request.get_json()

        submission_id = data.get('id')
        date = data.get('date')
        new_video_url = data.get('video_url')
        new_description = data.get('description')
        new_time_complete = data.get('time_complete')

        if not submission_id:
            return ito_api_response(success=False, message='Missing submission', status_code=400)

        if not new_video_url and not new_time_complete and not new_description:
            return ito_api_response(success=False, message='Missing required fields', status_code=400)

        submission_to_edit = session.query(Submission).filter(Submission.id == submission_id).first()

        if submission_to_edit.user_id != curr_user.id:
            return ito_api_response(success=False, message='You cannot edit this submission', status_code=403)

        if new_video_url:
            submission_to_edit.video_url = new_video_url

        if new_time_complete:
            new_milliseconds, new_seconds, new_minutes = extract_time_components(new_time_complete)
            new_time = convert_time_to_int(new_milliseconds, new_seconds, new_minutes)
            submission_to_edit.time_complete = new_time

        if new_description:
            submission_to_edit.description = new_description

        if date:
            if isinstance(date, int) or isinstance(date, float):
                submission_to_edit.date = datetime.datetime.fromtimestamp(date)
            else:
                date = datetime.datetime.strptime(date, "%Y-%m-%d")
                submission_to_edit.date = date

        session.commit()

        data = get_single_entry(submission_to_edit)

        update_submission_rankings(session, submission_to_edit.category, submission_to_edit.chapter,
                                   submission_to_edit.sub_chapter)
        update_player_scores(session)

        data['rank'] = submission_to_edit.rank

        return ito_api_response(success=True, data=data, message='Submission updated successfully', status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/league/submission/create', methods=['POST'])
@db_session
@authenticate(token_auth)
def create_league_submission(session):
    try:
        curr_user = token_auth.current_user()
        data = request.get_json()

        time_milliseconds = str(data.get('milliseconds'))
        time_seconds = data.get('seconds')
        time_minutes = data.get('minutes')
        week = data.get('week')
        level = data.get('level')
        video_url = data.get('video_url')

        season = 'su_25'
        if len(time_milliseconds) < 3:
            time_milliseconds += "0"
        time_int = convert_time_to_int(time_milliseconds, time_seconds, time_minutes)

        check_existing_run = (
            session.query(LeagueRun)
            .filter(LeagueRun.season == season, LeagueRun.week == week,
                    LeagueRun.level == level, LeagueRun.user_id == curr_user.id)
            .all()
        )

        if check_existing_run:
            for run in check_existing_run:
                session.delete(run)

        new_league_run = LeagueRun(date=datetime.datetime.now(), user_id=curr_user.id, season=season, week=week,
                                   level=level, video_url=video_url, time_complete=time_int)

        session.add(new_league_run)
        session.commit()

        update_league_rankings(session, season, week, level)

        return ito_api_response(success=True, data=None, message="League submission created", status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))