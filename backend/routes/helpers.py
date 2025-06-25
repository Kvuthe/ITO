from models import User, Submission, LeagueRun
from flask import jsonify
import datetime
import requests
from datetime import timedelta
import time
import re
import threading

def calculate_timeframe_score(user, time_frame, category):
    """ Calculates the user's score based on the specified time frame.

    :param user: The user object containing submissions
    :param time_frame: The time frame to calculate the score for ('all_time', 'monthly', 'weekly')
    :param category: The category of the submission
    :return: The calculated score
    """
    timeframe_total_score = 0

    now = datetime.datetime.now()
    if time_frame == 'monthly':
        cutoff_date = now - timedelta(days=30)
    elif time_frame == 'weekly':
        cutoff_date = now - timedelta(days=7)
    else:
        cutoff_date = None

    for submission in user.submissions:
        if submission.voided:
            continue

        if category != 'main board' and submission.category != category:
            continue

        if cutoff_date and submission.date < cutoff_date:
            continue

        timeframe_total_score += submission.points

    return timeframe_total_score

def update_player_scores(session):
    """ Updates all the users' scores in the database when a new submission is made.

    :param session: database connection
    """

    users = session.query(User).filter(User.role >= 1).all()

    for user in users:
        new_total_score = 0
        for submission in user.submissions:
            if submission.voided:
                continue
            new_total_score += submission.points
        user.score = new_total_score

    session.commit()

    return


def update_submission_rankings(session, category, chapter, sub_chapter):
    """ Updates all the individual submission rankings in their sub_chapter after a new submission is made.
    Assigns ranks and points where last gets 1 point, 2nd last gets 2 points, etc.

    :param session: database connection
    :param category: category for the submission
    :param chapter: chapter for the submission
    :param sub_chapter: subchapter for the submission
    """

    submissions = (
        session.query(Submission)
        .filter(Submission.category == category,
                Submission.chapter == chapter,
                Submission.sub_chapter == sub_chapter,
                Submission.voided == False)
        .order_by(Submission.time_complete.asc())
        .all()
    )

    total_submissions = len(submissions)
    prev_time = None
    prev_rank = 0
    count_same_time = 1

    for submission in submissions:
        if submission.time_complete == prev_time:
            submission.rank = prev_rank
            count_same_time += 1
        else:
            submission.rank = prev_rank + count_same_time
            prev_rank = submission.rank
            prev_time = submission.time_complete
            count_same_time = 1

        # Assign points based on reverse ranking
        submission.points = total_submissions - submission.rank + 1

    session.commit()

def update_league_rankings(session, season, week, level):
    """ Updates all the individual league run rankings after a new submission is made.
    Assigns ranks and points where last gets 1 point, 2nd last gets 2 points, etc.

    :param session: database connection
    :param season: season when submitted
    :param week: week number of submission
    :param level: level number of submission
    """

    runs = (
        session.query(LeagueRun)
        .filter(LeagueRun.season == season,
                LeagueRun.week == week,
                LeagueRun.level == level)
        .order_by(LeagueRun.time_complete.asc())
        .all()
    )

    total_runs = len(runs)
    prev_time = None
    prev_rank = 0
    count_same_time = 1

    for run in runs:
        if run.time_complete == prev_time:
            run.rank = prev_rank
            count_same_time += 1
        else:
            run.rank = prev_rank + count_same_time
            prev_rank = run.rank
            prev_time = run.time_complete
            count_same_time = 1

        # Assign points based on reverse ranking
        run.points = total_runs - run.rank + 1

    session.commit()

def extract_time_components(time_str):
    """
    Given a time string in “M:SS.mmm” (or “SS.mmm”) format, return three strings
    (milliseconds, seconds, minutes) so they can be fed into `convert_time_to_int(...)`.

    :param time_str: e.g. "0:17.180" or "17.180" (if no minutes)
    :return: (ms_str, sec_str, min_str)
    """
    if ':' in time_str:
        min_str, sec_ms = time_str.split(':', 1)
    else:
        min_str = '0'
        sec_ms = time_str

    if '.' in sec_ms:
        sec_str, ms_str = sec_ms.split('.', 1)
    else:
        sec_str = sec_ms
        ms_str = '0'

    return ms_str, sec_str, min_str


def convert_time_to_int(time_milliseconds, time_seconds, time_minutes):
    """ Converts three strings each respectively containing minutes, seconds, and milliseconds. This conversion is used
    to store integers in the database for the time complete rather than strings.

    :param time_milliseconds: string of milliseconds
    :param time_seconds: string of seconds
    :param time_minutes: string of minutes
    :return: integer representation of the input time string
    """

    time_arr = [time_milliseconds, time_seconds, time_minutes]
    multipliers = [1, 1000, 60000]

    time_stored_int = 0
    for i in range(len(time_arr)):
        if time_arr[i] == '':
            time_stored_int += 0
        else:
            time_stored_int += int(time_arr[i]) * multipliers[i]

    return time_stored_int

def convert_int_to_time(time_int):
    """ Converts an integer queried from the database and formats it into a time string following MM:ss.mmm format.

    :param time_int: integer queried from the database
    :return: String
    """

    milliseconds = time_int % 1000
    time_int //= 1000
    seconds = time_int % 60
    time_int //= 60
    minutes = time_int

    return f'{minutes}:{seconds:02d}.{milliseconds:03d}'

def get_all_list(entries):
    """ The return value of query.all() is not JSON serializable.
        This requires adding each entry retrieved from the database to be added into a List which is JSON serializable
        and therefore presentable to the user.

    :param entries: session query of the entries in the database.
    :return list: List containing each entry of the requested data
    """

    records = []
    for record in entries:
        single_record = {}
        for i, j in record.__dict__.items():
            if not i.startswith('_'):
                if isinstance(j, datetime.datetime):
                    single_record[i] = j.timestamp()
                elif i == 'time_complete':
                    single_record[i] = convert_int_to_time(j)
                else:
                    single_record[i] = j
        records.append(single_record)
    return records

def get_single_entry(single_entry):
    """ The return value of query.get() is not JSON serializable.
        This requires adding the single entry to a Dictionary which is JSON serializable.

    :param single_entry: session query of an entry in the database
    :return dict: Dictionary containing a single database entry
    """

    if single_entry is None:
        return None
    single_record = {}
    for i, j in single_entry.__dict__.items():
        if not i.startswith('_'):
            if isinstance(j, datetime.datetime):
                single_record[i] = j.timestamp()
            else:
                single_record[i] = j
    return single_record


def get_submission_entry(single_entry):
    """ Revised version of get_single_entry. Handles adding the user's username to the submission and converting the
        time back to a string.

    :param single_entry: session query of an entry in the database
    :return dict: Dictionary containing a single database entry
    """

    if single_entry is None:
        return None
    single_record = {}
    for i, j in single_entry.__dict__.items():
        if not i.startswith('_'):
            if isinstance(j, datetime.datetime):
                single_record[i] = j.timestamp()
            elif i == 'user':
                single_record[i] = single_entry.user.username
            elif i == 'time_complete':
                single_record[i] = convert_int_to_time(j)
            else:
                single_record[i] = j
    return single_record


def get_account_entry(user_entry):
    """ Revised version of get_single_entry.
        This version of the function also handles user submissions and makes them JSON serializable without having
        to query the submissions in a second database query.

    :param user_entry: session query of a user in the database
    :return dict: Dictionary containing information about the requested user
    """

    if user_entry is None:
        return None
    single_record = {}
    for i, j in user_entry.__dict__.items():
        if not i.startswith('_'):
            if isinstance(j, datetime.datetime):
                single_record[i] = j.timestamp()
            elif i == 'submissions':
                submission_arr = []
                for submission in j:
                    submission_arr.append(get_submission_entry(submission))
                single_record[i] = submission_arr
            else:
                single_record[i] = j
    return single_record

def ito_api_response(success, message, data=None, status_code=200, error=None):
    """ Structuring method to help format all API responses.

    :param success: boolean on whether the method was successful or not
    :param message: string containing the response message
    :param data: data queried
    :param status_code: number code corresponding to the status of the API call
    :param error: error that occurred
    :return:
    """
    response = {
        'success': success,
        'message': message,
        'data': data,
        'errors': error,
        'timestamp': datetime.datetime.now().isoformat(),
        'status_code': status_code
    }

    return jsonify(response), status_code


def organize_submissions(submissions):
    organized_data = {}

    chapter_score = {}

    for submission in submissions:
        category = submission['category']
        chapter = submission['chapter']

        if category not in organized_data:
            organized_data[category] = {}

        if category not in chapter_score:
            chapter_score[category] = {}

        if chapter not in organized_data[category]:
            organized_data[category][chapter] = []

        if chapter not in chapter_score[category]:
            chapter_score[category][chapter] = 0

        chapter_score[category][chapter] +=  submission['points']
        organized_data[category][chapter].append(submission)

    return organized_data, chapter_score


def get_user_categories(category_bits):
    categories = []

    if category_bits & 1:
        categories.append("Any%")

    if category_bits & 2:
        categories.append("In Bounds")

    return categories

def categories_to_bits(category_list):
    category_bits = 0

    if "Any%" in category_list:
        category_bits |= 1

    if "In Bounds" in category_list:
        category_bits |= 2

    return category_bits


def validate_username_whitelist(username):
    """ Whitelist for usernames

    :param username: str of username to be checked
    :return: tuple of username validity and string of error message
    """

    if not username:
        return False, "Username is required"

    username = username.strip()

    if len(username) > 120:
        return False, f"Username must be no more than 120 characters long"

    whitelist_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9]|[a-zA-Z0-9]*)$'

    if not re.match(whitelist_pattern, username):
        return False, "Username can only contain letters, numbers, underscores, hyphens, and periods. Must start and end with a letter or number."

    reserved_words = {
        'admin', 'administrator', 'mod', 'moderator', 'support', 'help',
        'system', 'bot', 'api', 'root', 'user', 'guest', 'anonymous',
        'null', 'undefined', 'delete', 'removed', 'banned', 'suspended',
        'official', 'staff', 'team', 'service', 'account', 'profile',
        'settings', 'config', 'test', 'demo', 'sample', 'example'
    }

    if username.lower() in reserved_words:
        return False, "This username is reserved and cannot be used"

    inappropriate_patterns = [
        r'fuck|shit|damn|bitch|ass|sex|porn|xxx',
        r'admin\d+|mod\d+|staff\d+',
        r'test\d+|demo\d+|sample\d+'
    ]

    for pattern in inappropriate_patterns:
        if re.search(pattern, username, re.IGNORECASE):
            return False, "Username contains inappropriate content"

    return True, "Username is valid"


def is_username_available(username, session, current_user_id=None):
    """ Check if a username is available

    :param username: str of username to be checked
    :param session: database session
    :param current_user_id: id of the current user
    :return: tuple of username validity and string of error message
    """

    is_valid, error_msg = validate_username_whitelist(username)
    if not is_valid:
        return False, error_msg

    existing_user = session.query(User).filter(
        User.username.ilike(username)
    ).first()

    if existing_user:
        if current_user_id and existing_user.id == current_user_id:
            return True, "Username is available"
        else:
            return False, "Username is already taken"

    return True, "Username is available"


def format_chapter(chapter):
    """ Reformats the chapter field of a submission to be url friendly

        :param chapter: str of the chapter to be reformatted
        :return: string of the url friendly chapter
    """
    return chapter.title().replace(" ", "+")

def format_subchapter(subchapter):
    """ Reformats the subchapter field of a submission to be url friendly

        :param subchapter: str of the subchapter to be reformatted
        :return: string of the url friendly subchapter
    """
    return subchapter.title().replace(" ", "+")


def get_first_place_run(session, category, chapter, sub_chapter):
    """Get the current first place run for a category/chapter/sub_chapter"""
    try:
        first_place = (
            session.query(Submission)
            .filter(
                Submission.category == category,
                Submission.chapter == chapter,
                Submission.sub_chapter == sub_chapter,
                Submission.voided == False,
                Submission.rank == 1
            )
            .order_by(Submission.date.desc())
            .first()
        )
        return first_place
    except Exception as e:
        print(f"Error getting first place run: {e}")
        return None


def notify_discord_bot(record_data):
    """Send HTTP POST to your Discord bot webhook endpoint in a separate thread"""
    # Start the notification process in a separate thread to avoid blocking the API response
    thread = threading.Thread(target=_notify_discord_bot_async, args=(record_data,))
    thread.daemon = True  # Thread will close when main program closes
    thread.start()


def _notify_discord_bot_async(record_data):
    """Internal async function to handle Discord bot notification with health check"""
    try:
        base_url = "https://ito-website-discord-bot.onrender.com"
        health_url = f"{base_url}/health"
        webhook_url = f"{base_url}/webhook/new-record"

        print("Attempting to wake up Discord bot service...")

        max_retries = 10
        retry_delay = 50  # seconds

        for attempt in range(max_retries):
            try:
                print(f"Health check attempt {attempt + 1}/{max_retries}")
                health_response = requests.get(health_url, timeout=30)

                if health_response.status_code == 200:
                    print("Discord bot service is healthy, sending notification...")
                    break
                else:
                    print(f"Health check failed with status {health_response.status_code}, retrying...")

            except requests.exceptions.RequestException as e:
                print(f"Health check attempt {attempt + 1} failed: {e}")

            if attempt < max_retries - 1:  # Don't sleep on the last attempt
                time.sleep(retry_delay)
        else:
            print(f"Failed to wake up Discord bot service after {max_retries} attempts")
            return

        print("Sending Discord notification...")
        response = requests.post(webhook_url, json=record_data, timeout=10)

        if response.status_code == 200:
            print(f"Discord notification sent successfully: {response.status_code}")
        else:
            print(f"Discord notification failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"Failed to notify Discord: {e}")