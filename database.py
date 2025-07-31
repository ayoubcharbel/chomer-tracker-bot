"""
Database helper functions for user activity tracking
"""

import sqlite3
import logging
from datetime import datetime
from config import DATABASE_NAME

logger = logging.getLogger(__name__)

def init_database():
    """Initialize the database with required tables"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                points INTEGER DEFAULT 0,
                message_count INTEGER DEFAULT 0,
                sticker_count INTEGER DEFAULT 0,
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create activity_log table for detailed tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                activity_type TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                points_earned INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

def add_or_update_user(user_id, username, first_name, last_name):
    """Add a new user or update existing user information"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
        exists = cursor.fetchone()
        
        if exists:
            # Update existing user
            cursor.execute('''
                UPDATE users 
                SET username = ?, first_name = ?, last_name = ?, last_activity = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (username, first_name, last_name, user_id))
        else:
            # Add new user
            cursor.execute('''
                INSERT INTO users (user_id, username, first_name, last_name)
                VALUES (?, ?, ?, ?)
            ''', (user_id, username, first_name, last_name))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error adding/updating user {user_id}: {e}")

def add_points(user_id, activity_type, points):
    """Add points to a user for a specific activity"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        # Update user points and activity counts
        if activity_type == "message":
            cursor.execute('''
                UPDATE users 
                SET points = points + ?, message_count = message_count + 1, last_activity = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (points, user_id))
        elif activity_type == "sticker":
            cursor.execute('''
                UPDATE users 
                SET points = points + ?, sticker_count = sticker_count + 1, last_activity = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (points, user_id))
        
        # Log the activity
        cursor.execute('''
            INSERT INTO activity_log (user_id, activity_type, points_earned)
            VALUES (?, ?, ?)
        ''', (user_id, activity_type, points))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error adding points for user {user_id}: {e}")

def get_leaderboard(limit=10):
    """Get the top users by points"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, username, first_name, last_name, points, message_count, sticker_count
            FROM users 
            WHERE points > 0
            ORDER BY points DESC, last_activity DESC
            LIMIT ?
        ''', (limit,))
        
        results = cursor.fetchall()
        conn.close()
        
        return results
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        return []

def get_user_stats(user_id):
    """Get detailed stats for a specific user"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT username, first_name, last_name, points, message_count, sticker_count, first_seen, last_activity
            FROM users 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting user stats for {user_id}: {e}")
        return None

def get_total_users():
    """Get total number of tracked users"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users")
        result = cursor.fetchone()[0]
        
        conn.close()
        return result
        
    except Exception as e:
        logger.error(f"Error getting total users: {e}")
        return 0

def get_user_rank(user_id):
    """Get the rank of a specific user"""
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) + 1 as rank
            FROM users 
            WHERE points > (SELECT points FROM users WHERE user_id = ?)
        ''', (user_id,))
        
        result = cursor.fetchone()[0]
        conn.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting user rank for {user_id}: {e}")
        return None