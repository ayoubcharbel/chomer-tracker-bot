const TelegramBot = require('node-telegram-bot-api');

// Emergency simple bot for Render deployment
const token = process.env.TELEGRAM_BOT_TOKEN || '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg';

console.log('🚀 Starting Simple Chomer Tracker Bot...');

const bot = new TelegramBot(token, { polling: true });

// Track basic stats in memory (temporary solution)
const userStats = new Map();

// Helper function to update stats
function updateUserStats(userId, username, firstName, fullName) {
  if (!userStats.has(userId)) {
    userStats.set(userId, {
      userId,
      username,
      firstName,
      fullName,
      messageCount: 0,
      stickerCount: 0,
      totalPoints: 0,
      lastActivity: new Date()
    });
  }
  
  const stats = userStats.get(userId);
  stats.messageCount++;
  stats.totalPoints = stats.messageCount + stats.stickerCount; // 1 point each
  stats.lastActivity = new Date();
  stats.username = username; // Update in case it changed
  stats.fullName = fullName; // Update in case it changed
  userStats.set(userId, stats);
}

// Helper function to update sticker stats
function updateStickerStats(userId, username, firstName, fullName) {
  if (!userStats.has(userId)) {
    userStats.set(userId, {
      userId,
      username,
      firstName,
      fullName,
      messageCount: 0,
      stickerCount: 0,
      totalPoints: 0,
      lastActivity: new Date()
    });
  }
  
  const stats = userStats.get(userId);
  stats.stickerCount++;
  stats.totalPoints = stats.messageCount + stats.stickerCount; // 1 point each
  stats.lastActivity = new Date();
  stats.username = username; // Update in case it changed
  stats.fullName = fullName; // Update in case it changed
  userStats.set(userId, stats);
}

// Track all messages
bot.on('message', (msg) => {
  if (!msg.from || msg.from.is_bot) return;
  
  // Only track group messages (not private messages)
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') return;
  
  const userId = msg.from.id.toString();
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  
  // Log the activity
  console.log(`👤 Activity from ${fullName} (@${username || 'no-username'}) in ${msg.chat.title || 'group'}`);
  
  // Check if this is a bot command (starts with /)
  const isCommand = msg.text && msg.text.startsWith('/');
  
  // Update stats based on message type (exclude commands)
  if (msg.sticker) {
    updateStickerStats(userId, username, firstName, fullName);
    console.log(`🎭 Sticker from ${fullName} (+1 point)`);
  } else if (!isCommand) {
    // Only count non-command messages for points
    updateUserStats(userId, username, firstName, fullName);
    console.log(`📨 Message from ${fullName}: ${msg.text ? msg.text.substring(0, 50) + '...' : '[media/other]'} (+1 point)`);
  } else {
    // Commands don't earn points but still log them
    console.log(`⚡ Command from ${fullName}: ${msg.text} (no points)`);
  }
  
  const currentStats = userStats.get(userId);
  console.log(`📊 ${fullName} stats: ${currentStats?.messageCount || 0} messages, ${currentStats?.stickerCount || 0} stickers, ${currentStats?.totalPoints || 0} points`);
});

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🤖 *Chomer Tracker Bot is Active!* 🤖

I'm now monitoring this group for the airdrop leaderboard!

*Available Commands:*
• /leaderboard - Show current leaderboard
• /help - Show help information
• /stats - Show your personal stats

*Point System:*
• 📨 1 point per message
• 🎭 1 point per sticker

Start chatting to earn points! 🏆
  `;
  
  try {
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending start message:', error);
  }
});

// Help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🆘 *Chomer Tracker Bot Help* 🆘

*Commands:*
• /start - Show welcome message
• /help - Show this help
• /leaderboard - Show top 10 members
• /stats - Show your stats

*How it works:*
• I track all messages and stickers
• Points: 1 per message, 1 per sticker  
• Leaderboard updates in real-time
• Data used for airdrop eligibility

Keep chatting to climb the leaderboard! 🚀
  `;
  
  try {
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending help message:', error);
  }
});

// Leaderboard command
bot.onText(/\/leaderboard/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Convert Map to Array and sort by points
    const leaderboard = Array.from(userStats.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
    
    if (leaderboard.length === 0) {
      await bot.sendMessage(chatId, 
        '🏆 *LEADERBOARD* 🏆\n\nNo activity yet! Start chatting to see the leaderboard!',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    let message = '🏆 *CURRENT LEADERBOARD* 🏆\n\n';
    
    leaderboard.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const displayName = user.username ? `@${user.username}` : user.fullName;
      
      message += `${medal} *${displayName}*\n`;
      message += `   📨 ${user.messageCount} messages`;
      if (user.stickerCount > 0) {
        message += ` | 🎭 ${user.stickerCount} stickers`;
      }
      message += ` | ⭐ ${user.totalPoints} points\n\n`;
    });
    
    message += '_Keep chatting to climb the ranks! 🚀_';
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    await bot.sendMessage(chatId, '❌ Error generating leaderboard. Please try again.');
  }
});

// Stats command
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id.toString();
  
  if (!userId || !userStats.has(userId)) {
    await bot.sendMessage(chatId, '📊 No stats yet! Send some messages to get started.');
    return;
  }
  
  const stats = userStats.get(userId);
  const displayName = stats.username ? `@${stats.username}` : stats.fullName;
  
  const statsMessage = `
📊 *Your Stats* 📊

*User:* ${displayName}
*Messages:* ${stats.messageCount}
*Stickers:* ${stats.stickerCount}  
*Total Points:* ${stats.totalPoints}

Keep being active to earn more points! 🎯
  `;
  
  try {
    await bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending stats:', error);
  }
});

// Error handlers
bot.on('error', (error) => {
  console.error('🚨 Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error);
});

// Test bot info on startup
bot.getMe().then(botInfo => {
  console.log(`✅ Bot started successfully: @${botInfo.username} (${botInfo.first_name})`);
  console.log('🤖 Simple Chomer Tracker Bot is now running!');
}).catch(error => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});