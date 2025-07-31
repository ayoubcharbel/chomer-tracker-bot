import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import logger from './logger';

// Simple test script to verify bot functionality
async function testBot() {
  logger.info('🔍 Starting bot debugging...');
  
  const bot = new TelegramBot(config.telegram.botToken, { polling: false });
  
  try {
    // Test 1: Check bot token validity
    logger.info('Test 1: Checking bot token...');
    const botInfo = await bot.getMe();
    logger.info(`✅ Bot token valid! Bot: @${botInfo.username} (${botInfo.first_name})`);
    
    // Test 2: Check webhook status
    logger.info('Test 2: Checking webhook status...');
    const webhookInfo = await bot.getWebHookInfo();
    logger.info('Webhook info:', webhookInfo);
    
    // Test 3: Get bot commands
    logger.info('Test 3: Getting bot commands...');
    const commands = await bot.getMyCommands();
    logger.info('Bot commands:', commands);
    
    logger.info('🎉 All tests passed! Bot should be working.');
    
  } catch (error) {
    logger.error('❌ Bot test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        logger.error('❌ ISSUE: Invalid bot token! Check TELEGRAM_BOT_TOKEN environment variable.');
      } else if (error.message.includes('network')) {
        logger.error('❌ ISSUE: Network connection problem. Check internet connectivity.');
      } else {
        logger.error('❌ ISSUE: Unknown error:', error.message);
      }
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBot().finally(() => process.exit(0));
}

export { testBot };