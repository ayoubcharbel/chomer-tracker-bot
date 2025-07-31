# Environment Setup Guide

## Required Environment Variables

Create these environment variables in your Render dashboard:

### Telegram Configuration
- `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather (already provided: `8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg`)

### Database Configuration  
- `DATABASE_URL`: Will be automatically provided by Render when you create a PostgreSQL database

### Application Configuration
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `3000` (or leave default)
- `LOG_LEVEL`: Set to `info`

### Points System (Optional)
- `POINTS_PER_MESSAGE`: Set to `1` (default)
- `POINTS_PER_STICKER`: Set to `2` (default)

## Quick Deploy Steps

1. **Fork this repository** to your GitHub account

2. **Create PostgreSQL Database** on Render:
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `chomer-tracker-db`
   - Plan: Starter (free)
   - Click "Create Database"

3. **Create Web Service** on Render:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `TELEGRAM_BOT_TOKEN`: `8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg`
     - `DATABASE_URL`: Copy from your database's "Internal Database URL"
     - `NODE_ENV`: `production`
     - `LOG_LEVEL`: `info`
   - Click "Create Web Service"

4. **Add Bot to Group**:
   - Find your bot: @YourBotName
   - Add it to your Telegram group
   - Make it an admin (required to read all messages)
   - Send `/start` in the group to activate

## Testing

Once deployed, test with these commands in your group:
- `/start` - Should show welcome message
- `/help` - Should show help information  
- `/leaderboard` - Should show current leaderboard (empty initially)

Send some messages and stickers, then check `/leaderboard` again to see tracking working!

## Monitoring

- Health check: `https://your-app-name.onrender.com/health`
- Stats endpoint: `https://your-app-name.onrender.com/stats`
- Logs available in Render dashboard

## Database Schema

The bot automatically creates these tables:
- `users` - Telegram user information
- `messages` - All tracked messages  
- `daily_stats` - Daily activity per user
- `weekly_stats` - Weekly activity per user
- `monthly_stats` - Monthly activity per user