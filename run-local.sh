#!/bin/bash

# Local/VPS deployment script
echo "🚀 Starting Chomer Tracker Bot locally..."

# Set environment variables
export TELEGRAM_BOT_TOKEN="8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg"
export NODE_ENV="production"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start bot with auto-restart
echo "🤖 Starting bot with PM2 for auto-restart..."

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start bot with PM2
pm2 start app.js --name "chomer-bot" --restart-delay=3000

echo "✅ Bot started with PM2!"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs chomer-bot"
echo "🛑 Stop bot: pm2 stop chomer-bot"