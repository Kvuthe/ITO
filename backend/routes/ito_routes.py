from apifairy import authenticate
from flask import request
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, asc
import datetime

from app import app
from routes.helpers import ito_api_response, get_single_entry, get_submission_entry, update_submission_rankings, \
    update_player_scores, get_all_list, calculate_timeframe_score
from models import Submission, User
from session import db_session

@app.route('/api/leaderboard/<game>/<category>/<chapter>/<sub_chapter>', methods=['GET'])
@db_session
def get_chapter_leaderboard_data(session, game, category, chapter, sub_chapter):

    try:

        if category == "any":
            category = "any%"
        if category == "in_bounds":
            category = "inbounds"

        sub_chapter = sub_chapter.replace("_", " ")
        chapter = chapter.replace("_", " ")

        sub_chapter_submissions = (
            session.query(Submission)
            .filter(Submission.chapter == chapter, Submission.game_title == game, Submission.category == category,
                    Submission.sub_chapter == sub_chapter, Submission.voided == False)
            .order_by(asc(Submission.time_complete))
            .options(joinedload(Submission.user))
            .all()
        )

        data = []

        for submission in sub_chapter_submissions:
            submission_data = get_submission_entry(submission)
            submission_data['user_flag'] = submission.user.flag
            submission_data['username_color'] = submission.user.username_color
            data.append(submission_data)

        return ito_api_response(success=True, message="Successfully retrieved chapter leaderboard data", data=data, status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


# TODO: Obsolete route
@app.route('/api/leaderboard/<game>/<category>', methods=['GET'])
@db_session
def get_category_leaderboard_data(session, game, category):

    try:

        if category == "any":
            category = "any%"

        users = (
            session.query(User)
            .join(Submission, User.id == Submission.user_id)
            .filter(Submission.category == category, Submission.game_title == game)
            .order_by(User.score.desc())
            .options(joinedload(User.submissions))
            .all()
        )

        return_data = []

        for user in users:
            number_of_runs = len(user.submissions)
            user_data = get_single_entry(user)
            user_data['submissions'] = number_of_runs
            return_data.append(user_data)

        return ito_api_response(success=True, message="Successfully retrieved category leaderboard data", data=return_data, status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))


@app.route('/api/leaderboard/recent_runs', methods=['GET'])
@db_session
def get_recent_runs(session):

    try:

        submissions = (
            session.query(Submission)
            .filter(Submission.voided == False)
            .order_by(Submission.date.desc())
            .limit(3)
            .options(joinedload(Submission.user))
            .all()
        )

        data = []

        for submission in submissions:
            submission_data = get_submission_entry(submission)
            submission_data['user_flag'] = submission.user.flag
            submission_data['username_color'] = submission.user.username_color
            data.append(submission_data)

        return ito_api_response(success=True, message="Successfully retrieved most recent runs", data=data, status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", status_code=500, error=str(error))


@app.route('/api/submission/highlights', methods=['GET'])
@db_session
def get_highlights(session):

    try:
        highlighted_submissions = (
            session.query(Submission)
            .filter(Submission.highlighted==True)
            .options(joinedload(Submission.user))
            .all()
        )

        data = []

        for submission in highlighted_submissions:
            submission_data = get_submission_entry(submission)
            submission_data['user_flag'] = submission.user.flag
            submission_data['username_color'] = submission.user.username_color
            data.append(submission_data)

        return ito_api_response(success=True, message="Successfully retrieved highlighted submissions", data=data, status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error))



@app.route('/api/leaderboard/users/<category>/<time_frame>', methods=['GET'])
@db_session
def get_user_leaderboard_data(session, category, time_frame):

    try:

        if category == "any":
            category = "any%"
            category_filter = or_(User.lb_pref == 1, User.lb_pref == 3)
        elif category == "in_bounds":
            category = 'inbounds'
            category_filter = or_(User.lb_pref == 2, User.lb_pref == 3)
        else:
            category = "main board"
            category_filter = or_()

        verified_users = (
            session.query(User)
            .filter(User.role >= 1)
            .filter(category_filter)
            .all()
        )

        response_data = []
        for user in verified_users:
            user_data = get_single_entry(user)
            user_data['timeframe_score'] = calculate_timeframe_score(user, time_frame, category)
            response_data.append(user_data)

        response_data.sort(key=lambda x: x['timeframe_score'], reverse=True)

        return ito_api_response(success=True, message="Successfully retrieved user leaderboard", data=response_data, status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/leaderboard/users/total', methods=['GET'])
@db_session
def get_user_total_leaderboard_data(session):

    try:

        verified_users = (
            session.query(User)
            .filter(User.role >= 1)
            .all()
        )

        response_data = get_all_list(verified_users)

        response_data.sort(key=lambda x: x['score'], reverse=True)

        return ito_api_response(success=True, message="Successfully retrieved user leaderboard", data=response_data, status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)

