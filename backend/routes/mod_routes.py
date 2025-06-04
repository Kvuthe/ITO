from apifairy import authenticate
from flask import request
import datetime

from sqlalchemy.orm import joinedload

from app import app
from routes.helpers import ito_api_response, get_single_entry, get_submission_entry, update_submission_rankings, \
    update_player_scores, get_all_list, convert_time_to_int
from routes.auth_routes import token_auth
from models import Submission, User
from session import db_session

@app.route('/api/submission/report', methods=['POST'])
@db_session
@authenticate(token_auth)
def report_submission(session):

    try:
        curr_user = token_auth.current_user()

        data = request.get_json()

        report_message = data.get('message')
        submission_id = data.get('run_id')

        if not report_message or not submission_id:
            return ito_api_response(success=False, message="Please provide a report message for this report", status_code=400)

        submission_to_report = session.query(Submission).filter(Submission.id == submission_id, Submission.reported == False).first()

        if not submission_to_report:
            return ito_api_response(success=False, message="No such submission", status_code=404)

        submission_to_report.reported_message = report_message
        submission_to_report.reported = True
        submission_to_report.reported_by = curr_user.id
        submission_to_report.reported_date = datetime.datetime.now()

        session.commit()



        return ito_api_response(success=True, message="Successfully reported submission", status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/submission/reports', methods=['GET'])
@db_session
# @authenticate(token_auth)
def get_reported_submissions(session):

    try:

        reported_submissions = (
            session.query(Submission)
            .filter(Submission.reported == True)
            .options(joinedload(Submission.user))
            .all()
        )

        response_data = []

        for submission in reported_submissions:
            submission_data = get_submission_entry(submission)
            submission_data['reporter'] = get_single_entry(submission.reporter)
            response_data.append(submission_data)

        return ito_api_response(success=True, data=response_data, message="Successfully reported submissions", status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/submission/restore', methods=['POST'])
@db_session
@authenticate(token_auth)
def restore_submission(session):
    try:

        curr_user = token_auth.current_user()

        if curr_user.role != 2:
            return ito_api_response(success=False, message="You are not authorized to perform this action", status_code=403)

        data = request.get_json()

        reported_submission_id = data.get('id')

        submission_to_restore = session.query(Submission).filter(Submission.id == reported_submission_id).first()

        if not submission_to_restore:
            return ito_api_response(success=False, message="This submission does not exist", status_code=404)

        if not submission_to_restore.reported:
            return ito_api_response(success=False, message="This submission has not been reported", status_code=400)

        submission_to_restore.reported = False
        submission_to_restore.reported_message = None
        submission_to_restore.reported_by = None
        submission_to_restore.reported_date = None

        session.commit()

        return ito_api_response(success=True, message="Successfully restored submission", status_code=200)


    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/submission/remove', methods=['POST'])
@db_session
@authenticate(token_auth)
def remove_submission(session):

    try:
        curr_user = token_auth.current_user()

        if curr_user.role != 2:
            return ito_api_response(success=False, message="You are not authorized to perform this action", status_code=403)

        data = request.get_json()

        reported_submission_id = data.get('id')

        submission_to_remove = session.query(Submission).filter(Submission.id == reported_submission_id).first()

        if not submission_to_remove:
            return ito_api_response(success=False, message="This submission does not exist", status_code=404)

        if not submission_to_remove.reported:
            return ito_api_response(success=False, message="This submission has not been reported", status_code=400)

        session.delete(submission_to_remove)
        session.commit()

        update_submission_rankings(session, submission_to_remove.category, submission_to_remove.chapter,
                                   submission_to_remove.sub_chapter)
        update_player_scores(session)

        return ito_api_response(success=True, message="Successfully removed submission", status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/mod/verification_queue', methods=['GET'])
@db_session
# @authenticate(token_auth)
def get_verification_queue(session):
    try:
        # curr_user = token_auth.current_user()
        #
        # if curr_user.role != 2:
        #     return ito_api_response(success=False, message="You are not authorized to perform this action", status_code=403)

        unverified_users = (
            session.query(User)
            .filter(User.role == 0)
            .all()
        )

        return_response = get_all_list(unverified_users)

        print(return_response)

        return ito_api_response(success=True, data=return_response, message="Successfully retrieved verification queue", status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", error=str(error), status_code=500)


@app.route('/api/mod/user/verify', methods=['POST'])
@db_session
@authenticate(token_auth)
def verify_user(session):

    try:
        curr_user = token_auth.current_user()

        if curr_user.role != 2:
            return ito_api_response(success=False, message="You are not authorized to perform this action", status_code=403)

        data = request.get_json()
        user_id = data.get('id')

        user_to_verify = session.query(User).filter(User.id == user_id).first()

        if not user_to_verify:
            return ito_api_response(success=False, message="This user does not exist", status_code=404)

        user_to_verify.role = 1
        session.commit()

        return ito_api_response(success=True, message="Successfully verified user", status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                error=str(error), status_code=500)


@app.route('/api/mod/user/deny', methods=['POST'])
@db_session
@authenticate(token_auth)
def deny_user(session):

    try:
        curr_user = token_auth.current_user()

        if curr_user.role != 2:
            return ito_api_response(success=False, message="You are not authorized to perform this action", status_code=403)

        data = request.get_json()
        user_id = data.get('id')

        user_to_deny = session.query(User).filter(User.id == user_id).first()

        if not user_to_deny:
            return ito_api_response(success=False, message="This user does not exist", status_code=404)

        user_to_deny.role = -1
        session.commit()

        return ito_api_response(success=True, message="Successfully rejected user", status_code=200)

    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                error=str(error), status_code=500)


@app.route('/api/submission/mod/create', methods=['POST'])
@db_session
def mod_create_submission(session):

    try:

        data = request.get_json()

        print(data)

        chapter = data.get('chapter').lower()
        sub_chapter = data.get('sub_chapter').lower()
        video_url = data.get('video_url')
        category = data.get('category').lower()
        time_minutes = data.get('minutes')
        time_seconds = data.get('seconds')
        time_milliseconds = data.get('milliseconds')
        description = data.get('description')
        user_id = data.get('user_id')

        if (not chapter or not sub_chapter or not video_url or not category
             or time_seconds is None or time_milliseconds is None or time_minutes is None):
            print(chapter, sub_chapter, video_url, category, time_seconds, time_milliseconds, time_minutes)
            return ito_api_response(success=False, message='Missing required fields', status_code=400)


        game_title = "itt"


        check_existing_submission = (
            session.query(Submission)
            .filter(Submission.category == category, Submission.chapter == chapter, Submission.sub_chapter == sub_chapter,
                    Submission.user_id == user_id)
            .all()
        )

        # This should handle multiple submissions from one player for a single subchapter
        for submission in check_existing_submission:
            submission.voided = True


        time_int = convert_time_to_int(time_milliseconds + "0", time_seconds, time_minutes)


        new_user_submission = Submission(date=datetime.datetime.now(), game_title=game_title, chapter=chapter,
                                         sub_chapter=sub_chapter, video_url=video_url, time_complete=time_int,
                                         category=category, user_id=user_id, voided=False, reported=False,
                                         description=description)


        session.add(new_user_submission)
        session.commit()

        update_submission_rankings(session, category, chapter, sub_chapter)
        update_player_scores(session)

        return ito_api_response(success=True, data=get_single_entry(new_user_submission), message='Submission created',
                                status_code=200)
    except Exception as error:
        print(error)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(error))
