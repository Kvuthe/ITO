from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, declarative_base, backref
from flask import jsonify, make_response
import jwt
import os
import datetime
import bcrypt
from bcrypt import hashpw, checkpw

API_KEY = os.environ.get("SECRET_KEY")
Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(120), index=True)
    email = Column(String(120), index=True, unique=True)
    password = Column(String(150))
    creation_date = Column(DateTime)
    score = Column(Integer)
    submissions = relationship('Submission', foreign_keys='Submission.user_id', backref='user')
    league_runs = relationship('LeagueRun', foreign_keys='LeagueRun.user_id', backref='user')
    role = Column(Integer) # Enumeration
    flag = Column(String(4))
    lb_pref = Column(Integer) # Bit map
    pronouns = Column(Integer) # Enumeration
    username_color = Column(String(7))

    def generate_password_hash(self, password):
        """ Generates a salt for a user's password and hashes both the password and the salt together

        :param password: string of characters representing the user's password
        :return binary: binary encoding of characters representing the user's password as a hash
        """

        salt = bcrypt.gensalt()
        hash_password = hashpw(password.encode('utf-8'), salt).decode('utf-8')
        self.password = hash_password

    def decode_password(self, entered_password):
        """ Compares the entered password with the password stored in the database and returns true if they match

        :param entered_password: password entered by the user trying to log in
        :param stored_password: password stored in the database associated with the user trying to log in
        :return boolean: True if passwords match
        """

        return checkpw(entered_password.encode(encoding='utf-8', errors='strict'), bytes(self.password, 'utf-8'))

class Token(Base):
    __tablename__ = 'token'
    id = Column(Integer, primary_key=True)
    access_token = Column(String(64))
    access_expiration = Column(DateTime)
    refresh_token = Column(String(64))
    refresh_expiration = Column(DateTime)
    user = Column(Integer, ForeignKey('user.id'))

    def create_token_response(self):
        access_token = {
            'access_token': self.access_token
        }

        refresh_token = {
            'refresh_token': self.refresh_token
        }

        encoded_access_token = jwt.encode(access_token, API_KEY, algorithm="HS256")
        encoded_refresh_token = jwt.encode(refresh_token, API_KEY, algorithm="HS256")

        response_data = {
            'access_token': encoded_access_token,
            'refresh_token': encoded_refresh_token
        }

        response_dict = {
            'success': True,
            'message': "Successfully created token",
            'data': response_data,
            'errors': None,
            'timestamp': datetime.datetime.now().isoformat(),
            'status_code': 200
        }

        response = make_response(jsonify(response_dict), 200)

        # Remove the cookie as it wasn't being set
        # response.set_cookie('refresh_token', encoded_refresh_token, secure=True,
        #                 expires=self.refresh_expiration, samesite="None", httponly=True)

        return response

    @staticmethod
    def clear_old_tokens(session):
        one_day_timedelta = datetime.timedelta(days=1)
        yesterday = datetime.datetime.now() - one_day_timedelta

        expired_tokens = session.query(Token).filter(Token.refresh_expiration < yesterday).all()

        for token in expired_tokens:
            session.delete(token)

        session.commit()

class Submission(Base):
    __tablename__ = 'submission'
    id = Column(Integer, primary_key=True)
    date = Column(DateTime)
    game_title = Column(String(32))
    time_complete = Column(Integer)
    category = Column(String(32))
    chapter = Column(String(32))
    sub_chapter = Column(String(32))
    description = Column(String(255))
    video_url = Column(String(255))
    rank = Column(Integer)
    points = Column(Integer)
    reported = Column(Boolean)
    reported_date = Column(DateTime)
    reported_message = Column(String(255))
    reported_by = Column(Integer, ForeignKey('user.id'))
    voided = Column(Boolean)
    highlighted = Column(Boolean)
    user_id = Column(Integer, ForeignKey('user.id'))

    reporter = relationship('User', foreign_keys=[reported_by], backref='reported_submissions')


class LeagueRun(Base):
    __tablename__ = 'league_run'
    id = Column(Integer, primary_key=True)
    date = Column(DateTime)
    season = Column(String(16))
    week = Column(Integer)
    level = Column(Integer)
    time_complete = Column(Integer)
    video_url = Column(String(255))
    user_id = Column(Integer, ForeignKey('user.id'))
    rank = Column(Integer)
    points = Column(Integer)