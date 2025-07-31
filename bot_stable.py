"""
Telegram Activity Tracker Bot - Ultra Stable Version
Fixed for AttributeError issues with python-telegram-bot
"""

import logging
import os
from datetime import datetime
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode

import database
from config import BOT_TOKEN, POINTS_PER_MESSAGE, POINTS_PER_STICKER, MAX_LEADERBOARD_ENTRIES

# Configure logging for cloud deployment
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize database
try:
    database.init_database()
    logger.info("✅ Database initialized successfully")
except Exception as e:
    logger.error(f"❌ Database initialization failed: {e}")
    raise

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    try:
        user = update.effective_user
        chat = update.effective_chat
        
        # Only respond in groups
        if chat.type in ['group', 'supergroup']:
            # Add user to database
            database.add_or_update_user(
                user.id, 
                user.username, 
                user.first_name, 
                user.last_name
            )
            
            welcome_message = f"""
🎉 Welcome to the Activity Tracker Bot! 

Hi {user.first_name}! I'm now tracking your activity in this group.

📊 **How it works:**
• Each message earns you 1 point
• Each sticker earns you 1 point
• Points accumulate over time (no reset)

🏆 **Commands:**
• /leaderboard - View top users
• /mystats - Check your stats
• /help - Show help

Good luck! 🚀
            """
            
            await update.message.reply_text(welcome_message, parse_mode=ParseMode.MARKDOWN)
        
        logger.info(f"User {user.first_name} ({user.id}) started the bot")
    except Exception as e:
        logger.error(f"Error in start command: {e}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command"""
    try:
        help_text = """
🤖 **Activity Tracker Bot**

🏆 `/leaderboard` - Top users
📊 `/mystats` - Your statistics
🎯 `/rank` - Your current rank
❓ `/help` - This help

**Points:** 1 per message/sticker
Keep chatting to earn more! 🚀
        """
        
        await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)
    except Exception as e:
        logger.error(f"Error in help command: {e}")

async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /leaderboard command"""
    try:
        chat = update.effective_chat
        
        if chat.type not in ['group', 'supergroup']:
            await update.message.reply_text("This command only works in group chats!")
            return
        
        top_users = database.get_leaderboard(MAX_LEADERBOARD_ENTRIES)
        
        if not top_users:
            await update.message.reply_text("No activity recorded yet! Start chatting! 📊")
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
    except Exception as e:
        logger.error(f"Error in leaderboard command: {e}")

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /mystats command"""
    try:
        user = update.effective_user
        chat = update.effective_chat
        
        if chat.type not in ['group', 'supergroup']:
            await update.message.reply_text("This command only works in group chats!")
            return
        
        database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
        stats = database.get_user_stats(user.id)
        rank = database.get_user_rank(user.id)
        
        if not stats:
            await update.message.reply_text("No stats found! Start chatting! 📊")
            return
        
        username, first_name, last_name, points, messages, stickers, first_seen, last_activity = stats
        
        stats_text = f"""
📊 **Your Statistics**

👤 **User:** {first_name}
🏆 **Rank:** #{rank}
⭐ **Points:** {points}
💬 **Messages:** {messages}

Keep chatting! 🚀
        """
        
        await update.message.reply_text(stats_text, parse_mode=ParseMode.MARKDOWN)
    except Exception as e:
        logger.error(f"Error in mystats command: {e}")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular messages and award points"""
    try:
        user = update.effective_user
        chat = update.effective_chat
        
        # Only track in groups, skip bots
        if chat.type not in ['group', 'supergroup'] or user.is_bot:
            return
        
        database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
        database.add_points(user.id, "message", POINTS_PER_MESSAGE)
        
        logger.info(f"User {user.first_name} earned {POINTS_PER_MESSAGE} point(s)")
    except Exception as e:
        logger.error(f"Error handling message: {e}")

async def handle_sticker(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle stickers and award points"""
    try:
        user = update.effective_user
        chat = update.effective_chat
        
        # Only track in groups, skip bots
        if chat.type not in ['group', 'supergroup'] or user.is_bot:
            return
        
        database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
        database.add_points(user.id, "sticker", POINTS_PER_STICKER)
        
        logger.info(f"User {user.first_name} earned {POINTS_PER_STICKER} point(s) for sticker")
    except Exception as e:
        logger.error(f"Error handling sticker: {e}")

def main() -> None:
    """Start the bot with maximum stability"""
    try:
        logger.info("🚀 Starting Telegram Activity Tracker Bot (Stable Version)")
        logger.info(f"Bot token configured: {'Yes' if BOT_TOKEN else 'No'}")
        
        # Validate bot token
        if not BOT_TOKEN or len(BOT_TOKEN) < 20:
            raise ValueError("Invalid or missing BOT_TOKEN")
        
        # Create application with minimal configuration
        application = Application.builder().token(BOT_TOKEN).build()
        
        # Add handlers
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("help", help_command))
        application.add_handler(CommandHandler("leaderboard", leaderboard))
        application.add_handler(CommandHandler("mystats", my_stats))
        
        # Message handlers
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        application.add_handler(MessageHandler(filters.Sticker.ALL, handle_sticker))
        
        logger.info("✅ Bot handlers configured successfully")
        logger.info("🤖 Starting polling with stable configuration...")
        
        # Use the most stable polling configuration
        application.run_polling()
        
    except Exception as e:
        logger.error(f"❌ Critical error starting bot: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        
        # Additional debugging info
        import sys
        import telegram
        logger.error(f"Python version: {sys.version}")
        logger.error(f"python-telegram-bot version: {telegram.__version__}")
        
        raise

if __name__ == '__main__':
    main()