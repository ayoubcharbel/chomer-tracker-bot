"""
Simplified Telegram Bot for cloud deployment - More stable version
"""

import logging
import os
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode

import database
from config import BOT_TOKEN, POINTS_PER_MESSAGE, POINTS_PER_STICKER, MAX_LEADERBOARD_ENTRIES

# Enable logging with better format for cloud
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize database
database.init_database()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    user = update.effective_user
    chat = update.effective_chat
    
    if chat.type in ['group', 'supergroup']:
        database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
        
        welcome_message = f"""
🎉 Welcome to the Activity Tracker Bot! 

Hi {user.first_name}! I'm tracking your activity in this group.

📊 **How it works:**
• Each message earns you 1 point
• Each sticker earns you 1 point
• Points accumulate over time

🏆 **Commands:**
• /leaderboard - View top users
• /mystats - Check your stats
• /help - Show help

Good luck! 🚀
        """
        
        await update.message.reply_text(welcome_message, parse_mode=ParseMode.MARKDOWN)
        logger.info(f"User {user.first_name} started the bot")

async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /leaderboard command"""
    chat = update.effective_chat
    
    if chat.type not in ['group', 'supergroup']:
        await update.message.reply_text("This command only works in group chats!")
        return
    
    top_users = database.get_leaderboard(MAX_LEADERBOARD_ENTRIES)
    
    if not top_users:
        await update.message.reply_text("No activity recorded yet! Start chatting to earn points! 📊")
        return
    
    leaderboard_text = "🏆 **LEADERBOARD** 🏆\n\n"
    medals = ["🥇", "🥈", "🥉"]
    
    for i, (user_id, username, first_name, last_name, points, messages, stickers) in enumerate(top_users):
        rank = i + 1
        medal = medals[i] if i < 3 else f"{rank}."
        
        display_name = first_name or "Unknown"
        if username:
            display_name += f" (@{username})"
        
        leaderboard_text += f"{medal} **{display_name}**\n"
        leaderboard_text += f"    Points: {points} | Messages: {messages}\n\n"
    
    await update.message.reply_text(leaderboard_text, parse_mode=ParseMode.MARKDOWN)

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /mystats command"""
    user = update.effective_user
    chat = update.effective_chat
    
    if chat.type not in ['group', 'supergroup']:
        await update.message.reply_text("This command only works in group chats!")
        return
    
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    stats = database.get_user_stats(user.id)
    rank = database.get_user_rank(user.id)
    
    if not stats:
        await update.message.reply_text("No stats found! Start chatting to earn points! 📊")
        return
    
    username, first_name, last_name, points, messages, stickers, first_seen, last_activity = stats
    
    stats_text = f"""
📊 **Your Statistics**

👤 **User:** {first_name}
🏆 **Rank:** #{rank}
⭐ **Total Points:** {points}
💬 **Messages:** {messages}

Keep chatting to earn more points! 🚀
    """
    
    await update.message.reply_text(stats_text, parse_mode=ParseMode.MARKDOWN)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular messages and award points"""
    user = update.effective_user
    chat = update.effective_chat
    
    if chat.type not in ['group', 'supergroup'] or user.is_bot:
        return
    
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    database.add_points(user.id, "message", POINTS_PER_MESSAGE)
    
    logger.info(f"User {user.first_name} earned {POINTS_PER_MESSAGE} point(s)")

async def handle_sticker(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle stickers and award points"""
    user = update.effective_user
    chat = update.effective_chat
    
    if chat.type not in ['group', 'supergroup'] or user.is_bot:
        return
    
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    database.add_points(user.id, "sticker", POINTS_PER_STICKER)
    
    logger.info(f"User {user.first_name} earned {POINTS_PER_STICKER} point(s) for sticker")

class HealthHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler for health checks"""
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "Bot is running", "service": "telegram-activity-bot"}')
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress HTTP server logs
        pass

def start_http_server():
    """Start HTTP server for Render port requirement"""
    port = int(os.environ.get('PORT', 10000))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    logger.info(f"HTTP server starting on port {port}")
    server.serve_forever()

def main() -> None:
    """Start the bot"""
    try:
        logger.info("Starting Telegram Activity Bot...")
        
        # Start HTTP server in background thread for Render
        http_thread = threading.Thread(target=start_http_server, daemon=True)
        http_thread.start()
        
        # Create application
        application = Application.builder().token(BOT_TOKEN).build()
        
        # Add handlers
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("leaderboard", leaderboard))
        application.add_handler(CommandHandler("mystats", my_stats))
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        application.add_handler(MessageHandler(filters.Sticker.ALL, handle_sticker))
        
        logger.info("Bot handlers configured successfully")
        logger.info("🤖 Bot is starting...")
        
        # Start the bot
        application.run_polling(drop_pending_updates=True)
        
    except Exception as e:
        logger.error(f"Critical error: {e}")
        raise

if __name__ == '__main__':
    main()