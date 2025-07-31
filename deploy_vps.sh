#!/bin/bash

echo "🚀 Deploying Telegram Bot to VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🐍 Installing Python and dependencies..."
sudo apt install python3 python3-pip screen git wget curl -y

# Install bot dependencies
echo "📚 Installing Python packages..."
pip3 install -r requirements.txt

# Create service file for systemd (auto-restart)
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/telegram-bot.service > /dev/null <<EOF
[Unit]
Description=Telegram Activity Tracker Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/python3 $(pwd)/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable telegram-bot.service
sudo systemctl start telegram-bot.service

echo ""
echo "✅ Bot deployed successfully!"
echo ""
echo "🔧 Useful commands:"
echo "  Check status: sudo systemctl status telegram-bot"
echo "  View logs: sudo journalctl -u telegram-bot -f"
echo "  Restart bot: sudo systemctl restart telegram-bot"
echo "  Stop bot: sudo systemctl stop telegram-bot"
echo ""
echo "🎉 Your bot is now running 24/7!"