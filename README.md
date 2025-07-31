# Telegram Activity Tracker Bot

A Telegram bot that tracks user activities in group chats and maintains a leaderboard for the most active participants. Perfect for community engagement and airdrops!

## Features

- 🏆 **Leaderboard System**: Track the most active users
- 📊 **Point System**: 1 point per message, 1 point per sticker
- 💾 **Persistent Storage**: Points accumulate over time (never reset)
- 📈 **Detailed Statistics**: Individual user stats and rankings
- 🎯 **Group Chat Only**: Works exclusively in Telegram groups
- 🔍 **Activity Logging**: Detailed activity tracking for transparency

## Commands

- `/start` - Initialize the bot and register user
- `/leaderboard` - View top 10 users by points
- `/mystats` - Check your personal statistics
- `/rank` - Check your current rank
- `/stats` - General bot statistics
- `/help` - Show help message

## Installation

1. **Clone or download the files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the bot**:
   - The bot token is already configured in `config.py`
   - You can modify point values and other settings in `config.py`

4. **Run the bot**:
   ```bash
   python bot.py
   ```

## Setup Instructions

1. **Add bot to your group**:
   - Search for your bot on Telegram using its username
   - Add it to your group chat
   - Make sure the bot has permission to read messages

2. **Start tracking**:
   - Users can send `/start` to register
   - The bot automatically tracks all messages and stickers
   - Use `/leaderboard` to see the current rankings

## Database Structure

The bot uses SQLite with two main tables:

### Users Table
- `user_id`: Telegram user ID (primary key)
- `username`: Telegram username
- `first_name`, `last_name`: User's name
- `points`: Total accumulated points
- `message_count`: Number of messages sent
- `sticker_count`: Number of stickers sent
- `first_seen`: When user was first registered
- `last_activity`: Last activity timestamp

### Activity Log Table
- `id`: Auto-increment ID
- `user_id`: Foreign key to users table
- `activity_type`: "message" or "sticker"
- `timestamp`: When the activity occurred
- `points_earned`: Points awarded for this activity

## Configuration Options

Edit `config.py` to customize:

- `POINTS_PER_MESSAGE`: Points awarded per message (default: 1)
- `POINTS_PER_STICKER`: Points awarded per sticker (default: 1)
- `MAX_LEADERBOARD_ENTRIES`: How many users to show in leaderboard (default: 10)
- `ADMIN_USER_IDS`: List of admin user IDs for special commands

## Files Overview

- `bot.py`: Main bot logic and handlers
- `database.py`: Database operations and queries
- `config.py`: Configuration settings
- `requirements.txt`: Python dependencies
- `user_activity.db`: SQLite database (created automatically)
- `bot.log`: Log file (created automatically)

## Usage for Airdrops

Since points never reset and accumulate over time, you can easily:

1. Run the bot in your community group
2. Let members accumulate points through natural activity
3. On your launch date, use `/leaderboard` to see the top user
4. Award the airdrop to the #1 ranked member

The bot maintains detailed logs and statistics, making it perfect for transparent community rewards and airdrops.

## Logging

The bot logs all activities to:
- Console output
- `bot.log` file

This ensures transparency and helps with debugging or verifying user activities.

## Security Notes

- The bot only responds to group chats, not private messages
- No admin commands are implemented by default (for security)
- All user data is stored locally in SQLite database
- Bot token is configured in `config.py` (keep this file secure)

## Support

If you encounter any issues:
1. Check the `bot.log` file for error messages
2. Ensure the bot has proper permissions in your group
3. Verify that the bot token is correct and active

Enjoy tracking your community's activity! 🚀