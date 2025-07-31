import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import logger from './logger';

// Simplified bot for testing basic functionality
class SimpleBotTest {
  private bot: TelegramBot;

  constructor() {
    logger.info('🤖 Initializing Simple Bot Test...');
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.setupBasicHandlers();
  }

  private setupBasicHandlers(): void {
    // Log all incoming messages
    this.bot.on('message', (msg) => {
      logger.info(`📨 Received message from ${msg.from?.first_name} (${msg.from?.id}): ${msg.text}`);
      logger.info(`Chat type: ${msg.chat.type}, Chat ID: ${msg.chat.id}`);
    });

    // Test start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      logger.info(`🚀 /start command received from chat ${chatId}`);
      
      try {
        await this.bot.sendMessage(chatId, 
          '🎉 *Bot is working!*\n\n' +
          'This is a test message to confirm the bot is responding to commands.\n\n' +
          'Try these commands:\n' +
          '• /test - Simple test response\n' +
          '• /info - Bot information\n' +
          '• /ping - Ping pong test',
          { parse_mode: 'Markdown' }
        );
        logger.info('✅ /start response sent successfully');
      } catch (error) {
        logger.error('❌ Failed to send /start response:', error);
      }
    });

    // Test command
    this.bot.onText(/\/test/, async (msg) => {
      const chatId = msg.chat.id;
      logger.info(`🧪 /test command received from chat ${chatId}`);
      
      try {
        await this.bot.sendMessage(chatId, '✅ Test successful! Bot is responding to commands.');
        logger.info('✅ /test response sent successfully');
      } catch (error) {
        logger.error('❌ Failed to send /test response:', error);
      }
    });

    // Info command
    this.bot.onText(/\/info/, async (msg) => {
      const chatId = msg.chat.id;
      logger.info(`ℹ️ /info command received from chat ${chatId}`);
      
      try {
        const botInfo = await this.bot.getMe();
        const info = `
🤖 *Bot Information:*
• Name: ${botInfo.first_name}
• Username: @${botInfo.username}
• ID: ${botInfo.id}
• Chat Type: ${msg.chat.type}
• Chat ID: ${chatId}
• Environment: ${config.app.nodeEnv}
        `;
        
        await this.bot.sendMessage(chatId, info, { parse_mode: 'Markdown' });
        logger.info('✅ /info response sent successfully');
      } catch (error) {
        logger.error('❌ Failed to send /info response:', error);
      }
    });

    // Ping command
    this.bot.onText(/\/ping/, async (msg) => {
      const chatId = msg.chat.id;
      logger.info(`🏓 /ping command received from chat ${chatId}`);
      
      try {
        const startTime = Date.now();
        const sentMsg = await this.bot.sendMessage(chatId, '🏓 Pong!');
        const responseTime = Date.now() - startTime;
        
        await this.bot.editMessageText(
          `🏓 Pong! Response time: ${responseTime}ms`,
          {
            chat_id: chatId,
            message_id: sentMsg.message_id,
          }
        );
        logger.info(`✅ /ping response sent successfully (${responseTime}ms)`);
      } catch (error) {
        logger.error('❌ Failed to send /ping response:', error);
      }
    });

    // Error handlers
    this.bot.on('error', (error) => {
      logger.error('🚨 Bot error:', error);
    });

    this.bot.on('polling_error', (error) => {
      logger.error('🚨 Polling error:', error);
    });

    logger.info('✅ Simple bot handlers setup complete');
  }

  public async start(): Promise<void> {
    try {
      const botInfo = await this.bot.getMe();
      logger.info(`🚀 Simple Bot started: @${botInfo.username}`);
      logger.info('Bot is now listening for messages...');
    } catch (error) {
      logger.error('❌ Failed to start simple bot:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.stopPolling();
      logger.info('🛑 Simple bot stopped');
    } catch (error) {
      logger.error('❌ Error stopping simple bot:', error);
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

// Start the simple bot
const simpleBot = new SimpleBotTest();
simpleBot.start().catch(error => {
  logger.error('Failed to start simple bot:', error);
  process.exit(1);
});

export default SimpleBotTest;