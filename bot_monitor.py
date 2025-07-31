#!/usr/bin/env python3
"""
Bot Health Monitor - Ensures your bot stays running
Run this alongside your main bot for monitoring
"""

import time
import subprocess
import logging
import os
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - MONITOR - %(message)s',
    handlers=[
        logging.FileHandler('bot_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def is_bot_running():
    """Check if the main bot process is running"""
    try:
        result = subprocess.run(['pgrep', '-f', 'bot_worker.py'], 
                              capture_output=True, text=True)
        return len(result.stdout.strip()) > 0
    except:
        return False

def restart_bot():
    """Restart the bot if it's not running"""
    try:
        logger.warning("🔄 Bot not running, attempting restart...")
        
        # Kill any zombie processes
        subprocess.run(['pkill', '-f', 'bot_worker.py'], capture_output=True)
        time.sleep(2)
        
        # Start bot in screen session
        subprocess.run([
            'screen', '-dmS', 'activity-bot-auto', 
            'python3', 'bot_worker.py'
        ], cwd='/home/ubuntu/telegram-bot')
        
        time.sleep(5)
        
        if is_bot_running():
            logger.info("✅ Bot restarted successfully")
            return True
        else:
            logger.error("❌ Failed to restart bot")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error restarting bot: {e}")
        return False

def check_system_resources():
    """Monitor system resources"""
    try:
        # Check memory usage
        result = subprocess.run(['free', '-m'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        if len(lines) > 1:
            mem_line = lines[1].split()
            used_mem = int(mem_line[2])
            total_mem = int(mem_line[1])
            mem_percent = (used_mem / total_mem) * 100
            
            if mem_percent > 90:
                logger.warning(f"⚠️  High memory usage: {mem_percent:.1f}%")
        
        # Check disk space
        result = subprocess.run(['df', '-h', '/'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        if len(lines) > 1:
            disk_line = lines[1].split()
            disk_usage = disk_line[4].replace('%', '')
            if int(disk_usage) > 85:
                logger.warning(f"⚠️  High disk usage: {disk_usage}%")
                
    except Exception as e:
        logger.error(f"Error checking resources: {e}")

def main():
    """Main monitoring loop"""
    logger.info("🔍 Bot monitor started")
    
    consecutive_failures = 0
    
    while True:
        try:
            if is_bot_running():
                if consecutive_failures > 0:
                    logger.info("✅ Bot is running normally")
                    consecutive_failures = 0
                
                # Check system resources every 10 minutes
                if int(time.time()) % 600 == 0:
                    check_system_resources()
                    
            else:
                consecutive_failures += 1
                logger.warning(f"⚠️  Bot not running (failure #{consecutive_failures})")
                
                if consecutive_failures >= 3:
                    logger.error("❌ Bot has failed multiple times, attempting restart")
                    if restart_bot():
                        consecutive_failures = 0
                    else:
                        logger.error("💀 Critical: Unable to restart bot")
                        # Could send alert email/notification here
            
            time.sleep(30)  # Check every 30 seconds
            
        except KeyboardInterrupt:
            logger.info("🛑 Monitor stopped by user")
            break
        except Exception as e:
            logger.error(f"❌ Monitor error: {e}")
            time.sleep(60)  # Wait longer on errors

if __name__ == "__main__":
    main()