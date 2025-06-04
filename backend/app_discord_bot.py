import asyncio
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from discord_bot import get_record_notifier, get_bot_loop

load_dotenv('env_prod.env')

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    @app.route('/webhook/new-record', methods=['POST'])
    def handle_new_record():
        """Webhook endpoint to receive new record notifications"""
        try:
            record_data = request.get_json()

            if not record_data:
                return jsonify({'success': False, 'message': 'No data provided'}), 400

            print(f"Received new record webhook: {record_data.get('username')} - "
                  f"{record_data.get('chapter')} {record_data.get('sub_chapter')}")

            bot_loop = get_bot_loop()
            record_notifier = get_record_notifier()

            if bot_loop and record_notifier:
                asyncio.run_coroutine_threadsafe(
                    record_notifier.post_new_record(record_data),
                    bot_loop
                )
                return jsonify({'success': True, 'message': 'Record notification scheduled'}), 200
            else:
                return jsonify({'success': False, 'message': 'Discord bot not ready'}), 503

        except Exception as e:
            print(f"Webhook error: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        bot_loop = get_bot_loop()
        record_notifier = get_record_notifier()

        return jsonify({
            'status': 'healthy',
            'discord_bot_ready': bot_loop is not None and record_notifier is not None
        }), 200

    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({'message': 'Discord Bot Webhook Server Running'}), 200

    return app