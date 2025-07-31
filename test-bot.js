const TelegramBot = require('node-telegram-bot-api');

// Simple JavaScript test (no TypeScript needed)
const token = '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg';

console.log('🔍 Testing bot connection...');

const bot = new TelegramBot(token, { polling: true });

// Test bot info
bot.getMe().then(botInfo => {
  console.log('✅ Bot token is valid!');
  console.log(`Bot: @${botInfo.username} (${botInfo.first_name})`);
  console.log('Bot ID:', botInfo.id);
}).catch(error => {
  console.error('❌ Bot token test failed:', error.message);
  process.exit(1);
});

// Log all messages
bot.on('message', (msg) => {
  console.log(`📨 Message from ${msg.from?.first_name} (${msg.from?.id})`);
  console.log(`Chat: ${msg.chat.type} (${msg.chat.id})`);
  console.log(`Text: ${msg.text}`);
  console.log('---');
});

// Simple start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`🚀 /start command from chat ${chatId}`);
  
  try {
    await bot.sendMessage(chatId, 
      '🎉 *TEST BOT IS WORKING!*\n\n' +
      'If you see this message, the bot token is working correctly.\n\n' +
      'Try these test commands:\n' +
      '• /ping - Test response\n' +
      '• /info - Bot info\n' +
      '• /debug - Debug info',
      { parse_mode: 'Markdown' }
    );
    console.log('✅ /start response sent');
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
  }
});

// Ping command
bot.onText(/\/ping/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`🏓 /ping from chat ${chatId}`);
  
  try {
    await bot.sendMessage(chatId, '🏓 Pong! Bot is responding!');
    console.log('✅ /ping response sent');
  } catch (error) {
    console.error('❌ Failed to send ping:', error.message);
  }
});

// Info command
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`ℹ️ /info from chat ${chatId}`);
  
  try {
    const info = `
🤖 *Bot Debug Info:*
• Chat ID: ${chatId}
• Chat Type: ${msg.chat.type}
• Your ID: ${msg.from?.id}
• Your Name: ${msg.from?.first_name}
• Time: ${new Date().toISOString()}
    `;
    
    await bot.sendMessage(chatId, info, { parse_mode: 'Markdown' });
    console.log('✅ /info response sent');
  } catch (error) {
    console.error('❌ Failed to send info:', error.message);
  }
});

// Debug command
bot.onText(/\/debug/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`🐛 /debug from chat ${chatId}`);
  
  try {
    const botInfo = await bot.getMe();
    const debug = `
🔧 *Debug Information:*

**Bot Details:**
• Name: ${botInfo.first_name}
• Username: @${botInfo.username}
• ID: ${botInfo.id}

**Chat Details:**
• Chat ID: ${chatId}
• Chat Type: ${msg.chat.type}
• Chat Title: ${msg.chat.title || 'N/A'}

**User Details:**
• User ID: ${msg.from?.id}
• Username: @${msg.from?.username || 'none'}
• Name: ${msg.from?.first_name} ${msg.from?.last_name || ''}

**Message Details:**
• Message ID: ${msg.message_id}
• Date: ${new Date(msg.date * 1000).toISOString()}

This debug info helps identify setup issues!
    `;
    
    await bot.sendMessage(chatId, debug, { parse_mode: 'Markdown' });
    console.log('✅ /debug response sent');
  } catch (error) {
    console.error('❌ Failed to send debug info:', error.message);
  }
});

// Error handlers
bot.on('error', (error) => {
  console.error('🚨 Bot error:', error.message);
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message);
});

console.log('🤖 Test bot started! Add it to your group and try commands.');
console.log('Press Ctrl+C to stop.');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});