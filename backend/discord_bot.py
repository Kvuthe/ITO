import os
import asyncio
import threading
from dotenv import load_dotenv
import discord
from discord.ext import commands
from datetime import datetime

load_dotenv('env_prod.env')

BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
DISCORD_FORUM_CHANNEL_ID = int(os.getenv('DISCORD_FORUM_CHANNEL_ID', '0'))
DISCORD_THREAD_ID = int(os.getenv('DISCORD_THREAD_ID', '0'))

# OLD TEST CHANNEL DATA
# DISCORD_FORUM_CHANNEL_ID = 1068757629637234748
# DISCORD_THREAD_ID = 1379502758708776960

_bot = None
_record_notifier = None
_bot_loop = None


class RecordNotifier:
    def __init__(self, bot):
        self.bot = bot

    async def post_new_record(self, record_data: dict, thread_id: int = DISCORD_THREAD_ID):
        """Post a new record announcement to an existing forum thread or create a new one"""
        try:
            channel = self.bot.get_channel(DISCORD_FORUM_CHANNEL_ID)
            if not channel:
                print(f"Could not find forum channel with ID: {DISCORD_FORUM_CHANNEL_ID}")
                return False

            if not isinstance(channel, discord.ForumChannel):
                print(f"Channel {DISCORD_FORUM_CHANNEL_ID} is not a forum channel")
                return False

            username = record_data.get('username', 'Unknown Player')
            chapter = record_data.get('chapter', '').replace('_', ' ').title()
            sub_chapter = record_data.get('sub_chapter', '').replace('_', ' ').title()
            category = record_data.get('category', '').replace('_', ' ').title()
            time_str = record_data.get('time_complete', 'Unknown Time')
            video_url = record_data.get('video_url', '')
            improvement_ms = record_data.get('improvement_ms')

            print("Improvement", improvement_ms)

            if improvement_ms == 0:
                embed = discord.Embed(
                    title="🏆 RECORD TIED! 🏆",
                    description=f"**{username}** has tied the current record!",
                    color=discord.Color.gold(),
                    timestamp=datetime.now()
                )
            else:
                embed = discord.Embed(
                    title="🏆 NEW RECORD SET! 🏆",
                    description=f"**{username}** has set a new record!",
                    color=discord.Color.gold(),
                    timestamp=datetime.now()
                )

            embed.add_field(
                name="Map",
                value=f"{chapter}\n{sub_chapter}",
                inline=True
            )

            embed.add_field(
                name="Category",
                value=category,
                inline=True
            )

            embed.add_field(
                name="New Time",
                value=f"**{time_str}**",
                inline=True
            )

            if improvement_ms and improvement_ms > 0:
                improvement_seconds = improvement_ms / 1000
                embed.add_field(
                    name="📈 Improvement",
                    value=f"**-{improvement_seconds:.3f}s**",
                    inline=True
                )

            if video_url:
                embed.add_field(
                    name="Video",
                    value=f"[Watch Run]({video_url})",
                    inline=False
                )

            embed.set_footer(text="ITO Speedrun Records")

            if thread_id:
                try:
                    thread = self.bot.get_channel(thread_id)
                    if not thread:
                        thread = await self.bot.fetch_channel(thread_id)

                    if thread and isinstance(thread, discord.Thread):
                        await thread.send(embed=embed)
                        print(f"Successfully posted to existing thread: {thread.name}")
                        return True
                    else:
                        print(f"Could not find thread with ID: {thread_id}")
                        return False
                except Exception as e:
                    print(f"Error posting to existing thread {thread_id}: {e}")
                    return False
            else:
                forum_title = f"🏆 {username} - {chapter} {sub_chapter} ({category}) - {time_str}"

                thread = await channel.create_thread(
                    name=forum_title[:100],
                    embed=embed,
                    reason="New speedrun record"
                )

                print(f"Successfully created new thread: {thread.thread.name}")
                return True

        except Exception as e:
            print(f"Error posting to Discord: {e}")
            return False


def create_bot():
    """Create and configure the Discord bot"""
    intents = discord.Intents.default()
    intents.message_content = True
    intents.members = True

    bot = commands.Bot(command_prefix='&', intents=intents)

    @bot.event
    async def on_ready():
        global _record_notifier, _bot_loop
        print(f"Discord bot ready: {bot.user.name}")
        print(f"Forum channel ID: {DISCORD_FORUM_CHANNEL_ID}")

        _bot_loop = asyncio.get_event_loop()
        _record_notifier = RecordNotifier(bot)

    return bot


def run_discord_bot():
    """Run the Discord bot in its own thread"""
    global _bot

    print("Starting Discord bot...")

    if not BOT_TOKEN:
        print("ERROR: DISCORD_BOT_TOKEN not found in environment variables")
        return

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        _bot = create_bot()
        _bot.run(BOT_TOKEN)
    except Exception as e:
        print(f"Error running Discord bot: {e}")


def get_bot_loop():
    """Get the Discord bot's event loop"""
    return _bot_loop


def get_record_notifier():
    """Get the record notifier instance"""
    return _record_notifier


def get_bot():
    """Get the bot instance"""
    return _bot