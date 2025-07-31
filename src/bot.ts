import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { prisma } from './database';
import { UserService } from './services/userService';
import { MessageService } from './services/messageService';
import { StatsService } from './services/statsService';
import { setupLeaderboardCommand } from './commands/leaderboardCommand';
import { extractUserData, extractMessageData } from './utils/messageUtils';
import { startHealthServer } from './healthCheck';
import logger from './logger';

class ChomerTrackerBot {
  private bot: TelegramBot;
  private userService: UserService;
  private messageService: MessageService;
  private statsService: StatsService;

  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.userService = new UserService(prisma);
    this.messageService = new MessageService(prisma);
    this.statsService = new StatsService(prisma);

    this.setupEventListeners();
    this.setupCommands();
  }

  private setupEventListeners(): void {
    // Handle all messages for tracking
    this.bot.on('message', async (msg) => {
      try {
        await this.handleMessage(msg);
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    });

    // Handle bot errors
    this.bot.on('error', (error) => {
      logger.error('Bot error:', error);
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      logger.error('Polling error:', error);
    });

    logger.info('Event listeners setup complete');
  }

  private setupCommands(): void {
    // Setup leaderboard command
    setupLeaderboardCommand(this.bot, this.statsService);

    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🤖 *Chomer Tracker Bot is now active!* 🤖

I'm monitoring this group to track activity and create leaderboards for the airdrop.

*Available Commands:*
• /leaderboard - Show all-time leaderboard
• /leaderboard daily - Show today's leaderboard  
• /leaderboard weekly - Show this week's leaderboard
• /leaderboard monthly - Show this month's leaderboard

*Point System:*
• 📨 1 point per message
• 🎭 2 points per sticker

Let's see who's the most active! 🏆
      `;

      try {
        await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        logger.error('Error sending start message:', error);
      }
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
🆘 *Help - Chomer Tracker Bot* 🆘

*What I Do:*
• Track all messages and stickers in this group
• Calculate daily, weekly, and monthly statistics
• Maintain leaderboards for airdrop eligibility
• Store permanent records linked to your user ID

*Commands:*
• /start - Welcome message and setup
• /help - Show this help message
• /leaderboard [period] - Show leaderboards
  - No period = all-time leaderboard
  - daily = today's activity
  - weekly = this week's activity  
  - monthly = this month's activity

*Point System:*
• Regular messages: 1 point each
• Stickers: 2 points each

Your activity is permanently tracked for airdrop calculations! 🪂
      `;

      try {
        await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        logger.error('Error sending help message:', error);
      }
    });

    logger.info('Commands setup complete');
  }

  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    // Skip if no user (shouldn't happen, but safety first)
    if (!msg.from) {
      return;
    }

    // Skip bot messages
    if (msg.from.is_bot) {
      return;
    }

    // Only track group/supergroup messages (not private messages)
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
      return;
    }

    try {
      // Extract user and message data
      const userData = extractUserData(msg.from);
      const messageData = extractMessageData(msg);

      // Upsert user
      await this.userService.upsertUser(userData);

      // Record message
      await this.messageService.recordMessage(messageData);

      // Update statistics (async, don't wait)
      this.statsService.updateAllStats(userData.id).catch(error => {
        logger.error('Error updating stats:', error);
      });

      logger.debug(`Processed message from ${userData.fullName} (${userData.id}): ${messageData.messageType}`);
    } catch (error) {
      logger.error('Error processing message:', error);
    }
  }

  public async start(): Promise<void> {
    try {
      // Test database connection
      await prisma.$connect();
      logger.info('Database connected successfully');

      // Start health check server
      startHealthServer();

      // Get bot info
      const botInfo = await this.bot.getMe();
      logger.info(`Bot started successfully: @${botInfo.username} (${botInfo.first_name})`);

      logger.info('Chomer Tracker Bot is now running!');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.stopPolling();
      await prisma.$disconnect();
      logger.info('Bot stopped successfully');
    } catch (error) {
      logger.error('Error stopping bot:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the bot
const bot = new ChomerTrackerBot();
bot.start().catch(error => {
  logger.error('Failed to start bot:', error);
  process.exit(1);
});

export default ChomerTrackerBot;