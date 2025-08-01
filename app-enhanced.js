// Enhanced version with persistence and more features
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN || '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg';
const bot = new TelegramBot(token, { polling: true });

// File-based persistence (survives restarts)
const DATA_FILE = 'user_data.json';
let users = new Map();

// Load existing data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      users = new Map(Object.entries(data));
      console.log(`📊 Loaded data for ${users.size} users`);
    }
  } catch (error) {
    console.log('⚠️ Could not load existing data, starting fresh');
  }
}

// Save data periodically
function saveData() {
  try {
    const data = Object.fromEntries(users);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Data saved for ${users.size} users`);
  } catch (error) {
    console.error('❌ Failed to save data:', error);
  }
}

// Auto-save every 5 minutes
setInterval(saveData, 5 * 60 * 1000);

console.log('🚀 Enhanced Bot starting...');
loadData();

// Track messages with enhanced logging
bot.on('message', (msg) => {
  if (!msg.from || msg.from.is_bot || (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup')) return;
  
  const userId = msg.from.id.toString();
  const name = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  const timestamp = new Date().toISOString();
  
  if (!users.has(userId)) {
    users.set(userId, { 
      name, 
      username: msg.from.username, 
      messages: 0, 
      stickers: 0,
      joinedAt: timestamp,
      lastActive: timestamp
    });
    console.log(`👋 New user joined: ${name} (@${msg.from.username || 'no-username'})`);
  }
  
  const user = users.get(userId);
  user.lastActive = timestamp;
  user.name = name; // Update name in case it changed
  user.username = msg.from.username; // Update username
  
  // Only count non-commands
  if (msg.sticker) {
    user.stickers++;
    console.log(`🎭 Sticker from ${name} (Total: ${user.stickers})`);
  } else if (!msg.text || !msg.text.startsWith('/')) {
    user.messages++;
    const preview = msg.text ? msg.text.substring(0, 30) + '...' : '[media]';
    console.log(`📨 Message from ${name}: ${preview} (Total: ${user.messages})`);
  } else {
    console.log(`⚡ Command from ${name}: ${msg.text}`);
  }
});

// Enhanced commands
bot.onText(/\/start/, (msg) => {
  const welcomeMsg = `🎉 *Chomer Tracker Bot Active!*

I'm tracking activity for the airdrop! 

*How it works:*
📨 Regular messages = 1 point
🎭 Stickers = 1 point  
⚡ Commands = 0 points

*Available commands:*
/leaderboard - See top performers
/stats - Your personal stats
/help - Show this message

Start chatting to earn points! 🚀`;

  bot.sendMessage(msg.chat.id, welcomeMsg, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `🆘 *Chomer Tracker Help*

*Commands:*
/start - Welcome message
/leaderboard - Top 10 leaderboard  
/stats - Your personal statistics
/help - This help message

*Point System:*
• Messages: 1 point each
• Stickers: 1 point each
• Commands: 0 points

*Pro tip:* Be active in discussions to climb the leaderboard! 🎯`, 
    { parse_mode: 'Markdown' });
});

bot.onText(/\/leaderboard/, (msg) => {
  const sorted = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .filter(u => u.points > 0) // Only show users with activity
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
  
  if (sorted.length === 0) {
    return bot.sendMessage(msg.chat.id, '🏆 *LEADERBOARD* 🏆\n\nNo activity yet! Start chatting to see the rankings! 💬', { parse_mode: 'Markdown' });
  }
  
  let message = '🏆 *CHOMER AIRDROP LEADERBOARD* 🏆\n\n';
  sorted.forEach((user, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}️⃣`;
    const display = user.username ? `@${user.username}` : user.name;
    message += `${medal} *${display}*\n`;
    message += `   📨 ${user.messages} msgs | 🎭 ${user.stickers} stickers | ⭐ *${user.points} points*\n\n`;
  });
  
  message += `_Total tracked users: ${users.size}_\n`;
  message += `_Last updated: ${new Date().toLocaleString()}_`;
  
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
  const userId = msg.from.id.toString();
  const user = users.get(userId);
  
  if (!user || (user.messages + user.stickers) === 0) {
    return bot.sendMessage(msg.chat.id, '📊 No stats yet! Send some messages or stickers to get started! 💬🎭');
  }
  
  const display = user.username ? `@${user.username}` : user.name;
  const totalUsers = users.size;
  const userRank = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .sort((a, b) => b.points - a.points)
    .findIndex(u => u.name === user.name) + 1;
  
  const message = `📊 *YOUR AIRDROP STATS* 📊

👤 *User:* ${display}
📨 *Messages:* ${user.messages}
🎭 *Stickers:* ${user.stickers}
⭐ *Total Points:* ${user.messages + user.stickers}

🏆 *Rank:* #${userRank} of ${totalUsers}
📅 *Joined:* ${new Date(user.joinedAt).toLocaleDateString()}
🕐 *Last Active:* ${new Date(user.lastActive).toLocaleString()}

Keep being active to climb the leaderboard! 🚀`;
  
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// Admin command to export data (optional)
bot.onText(/\/export/, (msg) => {
  // Only allow specific admin user ID (replace with your Telegram ID)
  const adminId = '5743821794'; // Replace with your actual Telegram user ID
  
  if (msg.from.id.toString() !== adminId) {
    return; // Ignore if not admin
  }
  
  const data = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .sort((a, b) => b.points - a.points);
  
  const csvContent = 'Name,Username,Messages,Stickers,Total Points,Joined,Last Active\n' +
    data.map(u => 
      `"${u.name}","@${u.username || 'none'}",${u.messages},${u.stickers},${u.points},"${u.joinedAt}","${u.lastActive}"`
    ).join('\n');
  
  fs.writeFileSync('leaderboard_export.csv', csvContent);
  bot.sendDocument(msg.chat.id, 'leaderboard_export.csv', {
    caption: `📊 Leaderboard Export\n${data.length} users tracked`
  });
});

// Health check with enhanced info
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const totalUsers = users.size;
  const totalMessages = Array.from(users.values()).reduce((sum, u) => sum + u.messages, 0);
  const totalStickers = Array.from(users.values()).reduce((sum, u) => sum + u.stickers, 0);
  
  res.json({
    status: 'running',
    uptime: process.uptime(),
    users: totalUsers,
    totalMessages,
    totalStickers,
    totalPoints: totalMessages + totalStickers,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', users: users.size }));

app.get('/leaderboard', (req, res) => {
  const sorted = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);
  
  res.json({ leaderboard: sorted, total: users.size });
});

app.listen(port, () => {
  console.log(`✅ Enhanced Bot ready on port ${port}`);
  console.log('✅ Telegram bot active with persistence');
  console.log(`📊 Currently tracking ${users.size} users`);
});

// Enhanced error handling
bot.on('error', (error) => {
  console.error('🚨 Bot error:', error);
  saveData(); // Save data on error
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  saveData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  saveData();
  process.exit(0);
});