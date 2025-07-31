# Chomer Tracker Bot

A comprehensive Telegram bot for tracking group activity with persistent data storage, designed for airdrop eligibility tracking.

## Features

- **Message Tracking**: Monitors all messages, stickers, and media in group chats
- **User Management**: Tracks usernames, full names, and user activity
- **Statistics**: Daily, weekly, and monthly activity statistics
- **Leaderboards**: Multiple leaderboard views for different time periods
- **Points System**: Configurable point system for airdrop calculations
- **Persistent Storage**: PostgreSQL database with Prisma ORM
- **Scalable**: Ready for growing communities

## Commands

- `/start` - Initialize the bot and show welcome message
- `/help` - Show help information
- `/leaderboard` - Show all-time leaderboard
- `/leaderboard daily` - Show today's activity
- `/leaderboard weekly` - Show this week's activity
- `/leaderboard monthly` - Show this month's activity

## Point System

- **Regular Messages**: 1 point each
- **Stickers**: 2 points each

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Bot Framework**: node-telegram-bot-api
- **Database**: PostgreSQL with Prisma ORM
- **Logging**: Winston
- **Date Handling**: date-fns
- **Deployment**: Render.com ready

## Environment Variables

Required environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
POINTS_PER_MESSAGE=1
POINTS_PER_STICKER=2
```

## Database Schema

The bot uses the following main entities:

- **Users**: Telegram user information and metadata
- **Messages**: All tracked messages with type classification
- **DailyStats**: Daily activity statistics per user
- **WeeklyStats**: Weekly activity statistics per user
- **MonthlyStats**: Monthly activity statistics per user

## Deployment on Render

1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service on Render
4. Connect your forked repository
5. Use the provided `render.yaml` for automatic configuration
6. Set the required environment variables
7. Deploy!

### Manual Deployment Steps

1. **Database Setup**:
   - Create a new PostgreSQL database on Render
   - Copy the internal database URL

2. **Web Service Setup**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: `production`
     - Other optional variables as needed

3. **Bot Setup**:
   - Create a bot via @BotFather on Telegram
   - Get your bot token
   - Add the bot to your group as an administrator

## Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd chomer-tracker-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Database Migration

To deploy database changes:

```bash
npm run db:deploy
```

## Monitoring

The bot includes comprehensive logging with Winston. Logs are stored in:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- Console output - Formatted logs with colors

## Scaling Considerations

- Database indices are optimized for common queries
- Stats updates are performed asynchronously
- Connection pooling is handled by Prisma
- Horizontal scaling ready (stateless design)

## License

MIT License - See LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository.