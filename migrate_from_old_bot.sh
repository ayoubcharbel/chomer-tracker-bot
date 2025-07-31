#!/bin/bash

# Migrate from old bot to new improved bot
# This script safely replaces your old bot with the new one

SERVER_IP=${1:-"44.229.227.142"}
USERNAME=${2:-"ubuntu"}

echo "🔄 Migrating to new improved bot on $SERVER_IP"

ssh $USERNAME@$SERVER_IP << 'ENDSSH'
    echo "🛑 Stopping old bot processes..."
    
    # Stop any running Python bot processes
    pkill -f "python.*bot" || true
    pkill -f "telegram" || true
    
    # Kill any screen sessions with bots
    screen -ls | grep bot | cut -d. -f1 | awk '{print $1}' | xargs -r kill || true
    
    echo "🧹 Cleaning up old installation..."
    
    # Backup old bot data if exists
    if [ -d "telegram-bot" ]; then
        mv telegram-bot telegram-bot-backup-$(date +%Y%m%d)
        echo "📦 Old bot backed up"
    fi
    
    echo "📥 Installing new improved bot..."
    
    # Update system
    sudo apt update
    sudo apt install python3 python3-pip git screen htop -y
    
    # Clone new bot repository
    git clone https://github.com/ayoubcharbel/telegram-activity-bot.git telegram-bot
    cd telegram-bot
    
    # Install dependencies
    pip3 install -r requirements.txt
    
    echo "🔐 Setting up environment..."
    
    # Create environment file
    cat > .env << EOF
BOT_TOKEN=8396087536:AAEAOa6XjjpJ-sneI8L09wKMisnad-StdJg
DATABASE_NAME=user_activity.db
POINTS_PER_MESSAGE=1
POINTS_PER_STICKER=1
MAX_LEADERBOARD_ENTRIES=10
ENV=production
EOF
    
    echo "🚀 Starting new bot with better error handling..."
    
    # Start bot in screen with logging
    screen -dmS activity-bot bash -c 'python3 bot_worker.py 2>&1 | tee bot.log'
    
    echo "✅ New bot deployed successfully!"
    echo "📊 Check status: screen -r activity-bot"
    echo "📝 Check logs: tail -f ~/telegram-bot/bot.log"
    echo "🖥️  Monitor system: htop"
    
    # Show running processes
    echo ""
    echo "Running processes:"
    ps aux | grep python | grep -v grep
    
ENDSSH

echo ""
echo "🎉 Migration complete!"
echo ""
echo "🔧 Useful commands for monitoring:"
echo "   ssh $USERNAME@$SERVER_IP"
echo "   screen -r activity-bot    # View bot console"
echo "   tail -f telegram-bot/bot.log  # View logs"
echo "   htop                      # System monitor"