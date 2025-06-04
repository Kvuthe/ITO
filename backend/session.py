import sqlalchemy
from sqlalchemy.orm import sessionmaker
from models import Base
import os
import functools

# DB_URL = os.getenv('DB_TEST_STRING')
DB_URL = os.getenv('DB_STRING')
API_KEY = os.getenv('SECRET_KEY')

engine = sqlalchemy.create_engine(DB_URL)
Session = sqlalchemy.orm.sessionmaker()
Session.configure(bind=engine)

Base.metadata.create_all(engine)

def db_session(func):
    @functools.wraps(func)
    def session_handler(*args, **kwargs):
        session = Session()

        value = func(*args, **kwargs, session=session)

        session.close()
        return value

    return session_handler