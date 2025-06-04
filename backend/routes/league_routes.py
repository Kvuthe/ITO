from apifairy import authenticate
from flask import request, send_from_directory
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, asc
import datetime
import json
import re
import os

from app import app
from routes.helpers import ito_api_response, get_single_entry, get_submission_entry, update_submission_rankings, \
    update_player_scores, get_all_list, calculate_timeframe_score
from models import Submission, User, LeagueRun
from session import db_session


@app.route('/api/league_resources/images/<path:filename>')
def serve_season_resources(filename):
    resources_dir = os.path.join('league_resources', 'images')
    return send_from_directory(resources_dir, filename)

@app.route('/api/leagues/buttons/<season>/<week>', methods=['GET'])
@db_session
def get_buttons_leaderboard(session, season, week):
    try:
        season = 'su_25'  # current season
        button_data_fp = f'league_resources/{season}/button_data.json'

        with open(button_data_fp, 'r') as button_data_file:
            button_data = json.load(button_data_file)

        data_to_return = button_data[week]

        week_int = re.search(r'\d+', week).group()  # will fail if endpoint not 'week_#'

        for level in data_to_return:

            top_three_runs = (
                session.query(LeagueRun)
                .options(joinedload(LeagueRun.user))
                .filter(LeagueRun.week == week_int, LeagueRun.level == level)
                .order_by(LeagueRun.time_complete.asc())
                .limit(3)
                .all()
            )

            list_of_players = []
            for run in top_three_runs:
                list_of_players.append(get_submission_entry(run))

            data_to_return[level]['players'] = list_of_players

        return ito_api_response(success=True, status_code=200, data=data_to_return, message='success')

    except Exception as e:
        print(e)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(e))


@app.route('/api/leagues/<season>/<week>/<level>', methods=['GET'])
@db_session
def get_leagues_leaderboard(session, season, week, level):

    try:
        week_int = re.search(r'\d+', week).group()  # will fail if endpoint not 'week_#'

        leaderboard_data = (
            session.query(LeagueRun)
            .options(joinedload(LeagueRun.user))
            .filter(LeagueRun.week == week_int, LeagueRun.level == level, LeagueRun.season == season)
            .order_by(LeagueRun.time_complete.asc())
            .all()
        )

        runs = []

        for run in leaderboard_data:
            run_data = get_submission_entry(run)
            run_data['user_flag'] = run.user.flag
            run_data['username_color'] = run.user.username_color
            runs.append(run_data)

        return ito_api_response(success=True, status_code=200, data=runs, message='success')

    except Exception as e:
        print(e)
        return ito_api_response(success=False, message=f"Failed on {request.method} to {request.endpoint}",
                                status_code=500, error=str(e))