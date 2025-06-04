from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from flask import request
from session import *
from apifairy import authenticate
import secrets
import datetime
import jwt
from werkzeug.exceptions import Unauthorized, Forbidden
from app import app
from models import User, Token
from routes.helpers import ito_api_response

basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth(scheme='Bearer')


@token_auth.error_handler
def token_auth_error(status=401):
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code


@basic_auth.error_handler
def basic_auth_error(status=401):
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code, {'WWW-Authenticate': 'Form'}

@basic_auth.verify_password
def basic_auth_verify(username, password):
    """
    Verify a given username and password pair match with a user in the database.

    :param username: username provided by the user for their account
    :param password: password the user entered to log in to their account
    :return: User object if the username and password match; else None
    :rtype: User
    """

    if username and password:
        session = Session()
        get_user = session.query(User).filter(User.username.ilike(username)).first()
        if not get_user:
            session.close()
            return None
        elif get_user.decode_password(password):
            session.close()
            return get_user
        else:
            session.close()
            return None

@token_auth.verify_token
def token_auth_verify(access_token):
    """
    Retrieves the user associated with the access token.

    :param access_token: 32 char string encoded with HS256
    :return: User object if the access token is valid; else None
    :rtype: User
    """
    if access_token:
        access_decode = jwt.decode(access_token, API_KEY, algorithms=['HS256'])['access_token']

        session = Session()
        database_token = session.query(Token).filter_by(access_token=access_decode).first()

        try:
            if database_token.access_expiration > datetime.datetime.now():
                session.close()
                return session.query(User).filter_by(id=database_token.user).first()
            else:
                session.close()
                return None
        except Exception:
            session.close()
            return None

def _create_and_add_token(session, curr_user_id):
    access_token = secrets.token_urlsafe(32)
    access_expiration = datetime.datetime.now() + datetime.timedelta(minutes=20)
    # access_expiration = datetime.datetime.now() + datetime.timedelta(seconds=10)
    refresh_token = secrets.token_urlsafe(32)
    refresh_expiration = datetime.datetime.now() + datetime.timedelta(days=7)

    new_token = Token(access_token=access_token, access_expiration=access_expiration, refresh_token=refresh_token,
                      refresh_expiration=refresh_expiration, user=curr_user_id)

    new_token.clear_old_tokens(session)

    session.add(new_token)
    session.commit()

    return new_token


@app.route('/api/tokens/create', methods=['POST'])
@db_session
@authenticate(basic_auth)
def token_creation(session):
    """
    Create an authentication token for the user logging in. This token will be passed with every subsequent request the
    user makes in order to verify their authenticity.

    :param session: opened database session
    :return: api response with access token in the data and refresh token set in a cookie
    :rtype: Token Response
    """
    curr_user = basic_auth.current_user()

    new_token = _create_and_add_token(session, curr_user.id)

    return new_token.create_token_response(), 200

@app.route('/api/tokens/refresh', methods=['PUT'])
@db_session
def token_refresh(session):
    """
    Refresh an authentication token for the user logged in.

    :param session: opened database session
    :return: New authentication token
    :rtype: Token Response
    """

    try:

        bearer_access_token = request.headers.get('Authorization')
        bearer_refresh_token = request.get_json().get('refresh_token')

        bearer_access_token = bearer_access_token[7:] if bearer_access_token and bearer_access_token.startswith('Bearer ') else None

        if not bearer_access_token or not bearer_refresh_token:
            return ito_api_response(success=False, message="User is required to pass both their access token and refresh "
                                    "token.", status_code=400)

        access = jwt.decode(bearer_access_token,
                            API_KEY, algorithms=['HS256'])['access_token']
        refresh = jwt.decode(bearer_refresh_token, API_KEY, algorithms=['HS256'])['refresh_token']

        database_token = session.query(Token).filter_by(access_token=access).first()

        if not database_token:
            return ito_api_response(success=False, message="The access token provided cannot be found in the database.",
                                    status_code=460)

        if database_token.refresh_token != refresh:
            return ito_api_response(success=False, message="The provided access token and refresh token do not match.",
                                    status_code=401)

        if database_token.refresh_expiration < datetime.datetime.now():
            return ito_api_response(success=False, message="The provided refresh token is expired.",
                                    status_code=401)

        new_access_token = secrets.token_urlsafe(32)
        new_access_expiration = datetime.datetime.now() + datetime.timedelta(minutes=20)

        database_token.access_token = new_access_token
        database_token.access_expiration = new_access_expiration
        session.commit()

        data = database_token.create_token_response()

        return data, 200

    except Exception as e:
        print(e)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}", status_code=500, error=str(e))

@app.route('/api/tokens/delete', methods=['DELETE'])
@db_session
# @authenticate(token_auth)
def token_delete(session):
    """
    Delete an authentication token for the user logging out.

    :param session: opened database session
    :return:
    """

    access_token_deleted = request.headers.get('Authorization')

    access_token_deleted = access_token_deleted[7:] if access_token_deleted and access_token_deleted.startswith(
        'Bearer ') else None

    if not access_token_deleted:
        return ito_api_response(success=False, message="User is required to pass both their access token and refresh "
                                "token.", status_code=400)

    access = jwt.decode(access_token_deleted, API_KEY, algorithms=['HS256'])['access_token']

    if not access_token_deleted:
        return ito_api_response(success=False, message="Please provide an access token.",
                                status_code=408)

    access_token = session.query(Token).filter_by(access_token=access).first()

    if not access_token:
        return ito_api_response(success=False, message="The access token provided cannot be found in the database.",
                                status_code=460)

    session.delete(access_token)
    session.commit()

    return ito_api_response(success=True, message="Successfully deleted the access token. The user may logout",
                            status_code=200)
