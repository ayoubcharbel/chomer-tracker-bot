"""
Configuration file for the Telegram bot
Uses environment variables for security
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Bot Token - REQUIRED
BOT_TOKEN = os.getenv('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable is required!")

# Database configuration
DATABASE_NAME = os.getenv('DATABASE_NAME', 'user_activity.db')

# Point system
POINTS_PER_MESSAGE = int(os.getenv('POINTS_PER_MESSAGE', '1'))
POINTS_PER_STICKER = int(os.getenv('POINTS_PER_STICKER', '1'))

# Leaderboard settings
MAX_LEADERBOARD_ENTRIES = int(os.getenv('MAX_LEADERBOARD_ENTRIES', '10'))

# Environment
ENV = os.getenv('ENV', 'production')

# Admin commands (you can add admin user IDs here if needed)
ADMIN_USER_IDS = []  # Add admin user IDs here if you want admin-only commands

# Validate critical configuration
if len(BOT_TOKEN) < 20:
    raise ValueError("Invalid BOT_TOKEN - token appears to be malformed!")