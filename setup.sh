#!/bin/bash

echo "🤖 Setting up Telegram Activity Tracker Bot..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ Python 3 and pip3 found"

# Install requirements
echo "📦 Installing required packages..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ All packages installed successfully!"
else
    echo "❌ Failed to install packages. Please check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the bot:"
echo "  python3 bot.py"
echo ""
echo "Make sure to:"
echo "1. Add your bot to a Telegram group"
echo "2. Give it permission to read messages"
echo "3. Users can start with /start command"
echo ""
echo "Commands available:"
echo "  /leaderboard - View top users"
echo "  /mystats - Personal statistics"
echo "  /rank - Check your rank"
echo "  /help - Show help message"
echo ""
echo "Happy tracking! 🚀"