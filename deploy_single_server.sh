#!/bin/bash

# Deploy to a single server
# Usage: ./deploy_single_server.sh [SERVER_IP] [USERNAME]

SERVER_IP=${1:-"44.229.227.142"}
USERNAME=${2:-"ubuntu"}

echo "🚀 Deploying bot to $SERVER_IP as user $USERNAME"

# Copy files to server
scp -r . $USERNAME@$SERVER_IP:~/telegram-bot/

# SSH and setup
ssh $USERNAME@$SERVER_IP << 'ENDSSH'
    cd ~/telegram-bot
    
    # Install dependencies
    sudo apt update
    sudo apt install python3 python3-pip screen -y
    pip3 install -r requirements.txt
    
    # Create .env file
    echo "BOT_TOKEN=8396087536:AAEAOa6XjjpJ-sneI8L09wKMisnad-StdJg" > .env
    echo "ENV=production" >> .env
    
    # Start bot
    screen -dmS bot python3 bot_worker.py
    
    echo "✅ Bot running! Use 'screen -r bot' to check"
ENDSSH