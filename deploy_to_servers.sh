#!/bin/bash

# Deploy Telegram Bot to Multiple Servers
# Usage: ./deploy_to_servers.sh

echo "🚀 Deploying Telegram Activity Bot to your servers..."

# Server IPs (replace with your actual server details)
SERVERS=(
    "44.229.227.142"
    "54.188.71.94" 
    "52.13.128.108"
)

# Your server username (change as needed)
SERVER_USER="ubuntu"  # or "root", "admin", etc.

# Repository URL
REPO_URL="https://github.com/ayoubcharbel/telegram-activity-bot.git"

for SERVER in "${SERVERS[@]}"; do
    echo ""
    echo "📡 Deploying to server: $SERVER"
    echo "=================================="
    
    # SSH and deploy
    ssh $SERVER_USER@$SERVER << 'ENDSSH'
        echo "🔧 Setting up environment..."
        
        # Update system
        sudo apt update && sudo apt upgrade -y
        
        # Install Python and dependencies
        sudo apt install python3 python3-pip git screen -y
        
        # Clone repository (or pull if exists)
        if [ -d "telegram-activity-bot" ]; then
            cd telegram-activity-bot
            git pull origin main
            echo "📥 Updated existing repository"
        else
            git clone https://github.com/ayoubcharbel/telegram-activity-bot.git
            cd telegram-activity-bot
            echo "📦 Cloned repository"
        fi
        
        # Install Python dependencies
        pip3 install -r requirements.txt
        
        # Create environment file
        echo "🔐 Creating environment variables..."
        cat > .env << EOF
BOT_TOKEN=8396087536:AAEAOa6XjjpJ-sneI8L09wKMisnad-StdJg
DATABASE_NAME=user_activity.db
POINTS_PER_MESSAGE=1
POINTS_PER_STICKER=1
MAX_LEADERBOARD_ENTRIES=10
ENV=production
EOF
        
        # Stop any existing bot processes
        pkill -f "python.*bot" || true
        
        # Start bot in screen session
        screen -dmS telegram-bot python3 bot_worker.py
        
        echo "✅ Bot deployed and running on $(hostname -I | awk '{print $1}')"
        echo "📊 Check status with: screen -r telegram-bot"
        
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to $SERVER"
    else
        echo "❌ Failed to deploy to $SERVER"
    fi
    
done

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "🔧 To check bot status on any server:"
echo "   ssh $SERVER_USER@[SERVER_IP]"
echo "   screen -r telegram-bot"
echo ""
echo "🛑 To stop bot on any server:"
echo "   ssh $SERVER_USER@[SERVER_IP]"
echo "   screen -r telegram-bot"
echo "   Ctrl+C to stop, then Ctrl+A+D to detach"