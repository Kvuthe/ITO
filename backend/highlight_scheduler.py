from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from models import Submission
from session import db_session
import pytz
from sqlalchemy import func

@db_session
def rotate_highlighted_submissions(session):
    """
    Function to rotate highlighted submissions daily at 12:59 PM EST.
    - Sets highlighted=False for all currently highlighted submissions
    - Selects 3 random submissions with rank=1 and sets them to highlighted=True
    """
    try:
        currently_highlighted = session.query(Submission).filter(Submission.highlighted == True).all()
        for submission in currently_highlighted:
            submission.highlighted = False

        new_highlights = session.query(Submission) \
            .filter(Submission.rank == 1) \
            .order_by(func.random()) \
            .limit(3) \
            .all()

        if len(new_highlights) < 3:
            print(f"Warning: Only found {len(new_highlights)} submissions with rank=1")

        for submission in new_highlights:
            submission.highlighted = True

        session.commit()

        print(f"Highlighted submissions rotated at {datetime.now(pytz.timezone('US/Eastern'))}")
        print(f"New highlighted submission IDs: {[s.id for s in new_highlights]}")

    except Exception as error:
        print(f"Error rotating highlighted submissions: {error}")


def setup_highlight_scheduler():
    """
    Set up the scheduler to run the rotate_highlighted_submissions function
    every day at 12:59 PM EST.
    """
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        rotate_highlighted_submissions,
        trigger=CronTrigger(
            hour=12,
            minute=59,
            timezone=pytz.timezone('US/Eastern')
        ),
        id='rotate_highlighted_submissions',
        name='Rotate highlighted submissions daily',
        replace_existing=True
    )

    scheduler.start()
    print("Highlight rotation scheduler started")