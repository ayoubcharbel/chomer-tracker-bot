// Bot with keep-alive system to prevent Render sleep
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TELEGRAM_BOT_TOKEN || '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg';
const bot = new TelegramBot(token, { polling: true });

// In-memory storage
const users = new Map();

console.log('🚀 Bot starting with keep-alive...');

// Track messages (same as before)
bot.on('message', (msg) => {
  if (!msg.from || msg.from.is_bot || (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup')) return;
  
  const userId = msg.from.id.toString();
  const name = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  
  if (!users.has(userId)) {
    users.set(userId, { name, username: msg.from.username, messages: 0, stickers: 0 });
  }
  
  const user = users.get(userId);
  
  if (msg.sticker) {
    user.stickers++;
    console.log(`🎭 Sticker from ${name} (Total: ${user.stickers})`);
  } else if (!msg.text || !msg.text.startsWith('/')) {
    user.messages++;
    console.log(`📨 Message from ${name}: ${msg.text ? msg.text.substring(0, 30) + '...' : '[media]'} (Total: ${user.messages})`);
  } else {
    console.log(`⚡ Command from ${name}: ${msg.text}`);
  }
});

// Commands (same as before)
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🤖 *Chomer Tracker Bot Active!*\n\nSend messages to earn points!\n• Messages: 1 point\n• Stickers: 1 point\n• Commands: 0 points\n\nUse /leaderboard to see rankings! 🏆', { parse_mode: 'Markdown' });
});

bot.onText(/\/leaderboard/, (msg) => {
  const sorted = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .filter(u => u.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
  
  if (sorted.length === 0) {
    return bot.sendMessage(msg.chat.id, '🏆 *LEADERBOARD* 🏆\n\nNo activity yet! Start chatting! 💬', { parse_mode: 'Markdown' });
  }
  
  let message = '🏆 *CHOMER AIRDROP LEADERBOARD* 🏆\n\n';
  sorted.forEach((user, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}️⃣`;
    const display = user.username ? `@${user.username}` : user.name;
    message += `${medal} *${display}*\n   📨 ${user.messages} | 🎭 ${user.stickers} | ⭐ ${user.points} pts\n\n`;
  });
  
  message += `_Active users: ${users.size} | Updated: ${new Date().toLocaleTimeString()}_`;
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
  const userId = msg.from.id.toString();
  const user = users.get(userId);
  
  if (!user || (user.messages + user.stickers) === 0) {
    return bot.sendMessage(msg.chat.id, '📊 No stats yet! Send messages to get started! 💬');
  }
  
  const display = user.username ? `@${user.username}` : user.name;
  const message = `📊 *YOUR STATS* 📊\n\n👤 ${display}\n📨 Messages: ${user.messages}\n🎭 Stickers: ${user.stickers}\n⭐ Total: ${user.messages + user.stickers} points`;
  
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// Express server with keep-alive
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const uptime = Math.floor(process.uptime());
  res.json({
    status: 'active',
    uptime: `${uptime} seconds`,
    users: users.size,
    totalActivity: Array.from(users.values()).reduce((sum, u) => sum + u.messages + u.stickers, 0),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', users: users.size }));

app.get('/ping', (req, res) => {
  console.log('🏓 Keep-alive ping received');
  res.json({ 
    pong: true, 
    time: new Date().toISOString(),
    users: users.size 
  });
});

// KEEP-ALIVE SYSTEM
function keepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL || 'https://chomer-tracker-bot.onrender.com';
  
  // Self-ping every 10 minutes to prevent sleep
  setInterval(async () => {
    try {
      const response = await fetch(`${url}/ping`);
      const data = await response.json();
      console.log('🔄 Keep-alive ping successful:', data.time);
    } catch (error) {
      console.log('⚠️ Keep-alive ping failed (normal if running locally)');
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}

app.listen(port, () => {
  console.log(`✅ Bot ready on port ${port}`);
  console.log('✅ Telegram bot active');
  console.log('🔄 Keep-alive system enabled');
  
  // Start keep-alive system
  if (process.env.NODE_ENV === 'production') {
    keepAlive();
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('🚨 Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error);
});