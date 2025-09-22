from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from highlight_scheduler import setup_highlight_scheduler

load_dotenv('env_prod.env')
app = Flask(__name__)
app.json.sort_keys = False

setup_highlight_scheduler()

frontend_url = "https://ito-website-frontend.onrender.com"
testing_frontend_url = "http://localhost:5173"

CORS(app, resources=r"/api/*", supports_credentials=True, origins=[frontend_url, testing_frontend_url],
     allow_headers=['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'], methods=['GET', 'POST', 'PUT', 'DELETE'])

from routes import helpers, ito_routes, auth_routes, account_routes, mod_routes, league_routes

