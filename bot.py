"""
Telegram Bot for tracking user activities and maintaining leaderboard
"""

import logging
from datetime import datetime
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.constants import ParseMode

import database
from config import BOT_TOKEN, POINTS_PER_MESSAGE, POINTS_PER_STICKER, MAX_LEADERBOARD_ENTRIES

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize database
database.init_database()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
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
• Points accumulate over time (no daily reset)
• Compete for the top spot on the leaderboard!

🏆 **Commands:**
• /leaderboard - View top users
• /mystats - Check your personal stats
• /help - Show this help message

Good luck climbing the leaderboard! 🚀
        """
        
        await update.message.reply_text(welcome_message, parse_mode=ParseMode.MARKDOWN)
    
    logger.info(f"User {user.first_name} ({user.id}) started the bot in chat {chat.id}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command"""
    help_text = """
🤖 **Activity Tracker Bot Commands**

🏆 `/leaderboard` - View the top users by points
📊 `/mystats` - Check your personal statistics
🎯 `/rank` - Check your current rank
📈 `/stats` - General bot statistics
❓ `/help` - Show this help message

**Point System:**
• Messages: 1 point each
• Stickers: 1 point each
• Points accumulate forever (no reset)

Keep chatting to earn more points! 🚀
    """
    
    await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)

async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /leaderboard command"""
    chat = update.effective_chat
    
    # Only work in groups
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
        
        # Format name
        display_name = first_name or "Unknown"
        if username:
            display_name += f" (@{username})"
        
        leaderboard_text += f"{medal} **{display_name}**\n"
        leaderboard_text += f"    Points: {points} | Messages: {messages} | Stickers: {stickers}\n\n"
    
    leaderboard_text += f"📅 Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    await update.message.reply_text(leaderboard_text, parse_mode=ParseMode.MARKDOWN)

async def my_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /mystats command"""
    user = update.effective_user
    chat = update.effective_chat
    
    # Only work in groups
    if chat.type not in ['group', 'supergroup']:
        await update.message.reply_text("This command only works in group chats!")
        return
    
    # Ensure user is in database
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
🎨 **Stickers:** {stickers}

📅 **First seen:** {first_seen.split()[0]}
🕐 **Last activity:** {last_activity.split()[0]}

Keep chatting to earn more points! 🚀
    """
    
    await update.message.reply_text(stats_text, parse_mode=ParseMode.MARKDOWN)

async def bot_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /stats command - general bot statistics"""
    total_users = database.get_total_users()
    top_user = database.get_leaderboard(1)
    
    stats_text = f"📈 **Bot Statistics**\n\n"
    stats_text += f"👥 **Total Users:** {total_users}\n"
    
    if top_user:
        user_id, username, first_name, last_name, points, messages, stickers = top_user[0]
        display_name = first_name or "Unknown"
        if username:
            display_name += f" (@{username})"
        stats_text += f"👑 **Current Leader:** {display_name} ({points} points)\n"
    
    stats_text += f"\n📅 **Last updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    await update.message.reply_text(stats_text, parse_mode=ParseMode.MARKDOWN)

async def user_rank(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /rank command"""
    user = update.effective_user
    chat = update.effective_chat
    
    # Only work in groups
    if chat.type not in ['group', 'supergroup']:
        await update.message.reply_text("This command only works in group chats!")
        return
    
    # Ensure user is in database
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    
    stats = database.get_user_stats(user.id)
    rank = database.get_user_rank(user.id)
    total_users = database.get_total_users()
    
    if not stats:
        await update.message.reply_text("No rank found! Start chatting to earn points! 📊")
        return
    
    username, first_name, last_name, points, messages, stickers, first_seen, last_activity = stats
    
    rank_text = f"""
🎯 **Your Rank**

👤 **{first_name}**
🏆 **Rank:** #{rank} out of {total_users} users
⭐ **Points:** {points}

{"🔥 You're in the top 3! Keep it up!" if rank <= 3 else "Keep chatting to climb higher! 📈"}
    """
    
    await update.message.reply_text(rank_text, parse_mode=ParseMode.MARKDOWN)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular messages and award points"""
    user = update.effective_user
    chat = update.effective_chat
    
    # Only track in groups
    if chat.type not in ['group', 'supergroup']:
        return
    
    # Skip bot messages
    if user.is_bot:
        return
    
    # Add/update user in database
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    
    # Award points for message
    database.add_points(user.id, "message", POINTS_PER_MESSAGE)
    
    logger.info(f"User {user.first_name} ({user.id}) earned {POINTS_PER_MESSAGE} point(s) for a message in chat {chat.id}")

async def handle_sticker(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle stickers and award points"""
    user = update.effective_user
    chat = update.effective_chat
    
    # Only track in groups
    if chat.type not in ['group', 'supergroup']:
        return
    
    # Skip bot messages
    if user.is_bot:
        return
    
    # Add/update user in database
    database.add_or_update_user(user.id, user.username, user.first_name, user.last_name)
    
    # Award points for sticker
    database.add_points(user.id, "sticker", POINTS_PER_STICKER)
    
    logger.info(f"User {user.first_name} ({user.id}) earned {POINTS_PER_STICKER} point(s) for a sticker in chat {chat.id}")

def main() -> None:
    """Start the bot"""
    try:
        # Create application
        application = Application.builder().token(BOT_TOKEN).build()
        
        # Command handlers
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("help", help_command))
        application.add_handler(CommandHandler("leaderboard", leaderboard))
        application.add_handler(CommandHandler("mystats", my_stats))
        application.add_handler(CommandHandler("stats", bot_stats))
        application.add_handler(CommandHandler("rank", user_rank))
        
        # Message handlers
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        application.add_handler(MessageHandler(filters.Sticker.ALL, handle_sticker))
        
        # Log startup
        logger.info("Bot started successfully!")
        print("🤖 Bot is running! Press Ctrl+C to stop.")
        
        # Run the bot with error handling
        application.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True
        )
        
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
        print(f"❌ Bot failed to start: {e}")
        raise

if __name__ == '__main__':
    main()