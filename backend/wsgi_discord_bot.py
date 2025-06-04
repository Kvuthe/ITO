import threading

from app_discord_bot import create_app
from discord_bot import run_discord_bot


def create_wsgi_app():
    """Create and return the WSGI application"""
    bot_thread = threading.Thread(target=run_discord_bot, daemon=True)
    bot_thread.start()

    return create_app()


app = create_wsgi_app()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000, debug=False)