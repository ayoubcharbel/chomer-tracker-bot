// Ultra-simple bot - bypasses all errors
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN || '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg';
const bot = new TelegramBot(token, { polling: true });

// In-memory storage (no database issues)
const users = new Map();

console.log('🚀 Bot starting...');

// Track messages
bot.on('message', (msg) => {
  if (!msg.from || msg.from.is_bot || (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup')) return;
  
  const userId = msg.from.id.toString();
  const name = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  
  if (!users.has(userId)) {
    users.set(userId, { name, username: msg.from.username, messages: 0, stickers: 0 });
  }
  
  const user = users.get(userId);
  
  // Only count non-commands
  if (msg.sticker) {
    user.stickers++;
    console.log(`Sticker from ${name}`);
  } else if (!msg.text || !msg.text.startsWith('/')) {
    user.messages++;
    console.log(`Message from ${name}`);
  }
});

// Commands
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🤖 Bot is working! Send messages to earn points (1 per message, 1 per sticker)');
});

bot.onText(/\/leaderboard/, (msg) => {
  const sorted = Array.from(users.values())
    .map(u => ({ ...u, points: u.messages + u.stickers }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
  
  if (sorted.length === 0) {
    return bot.sendMessage(msg.chat.id, '🏆 No activity yet! Start chatting!');
  }
  
  let message = '🏆 LEADERBOARD 🏆\n\n';
  sorted.forEach((user, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    const display = user.username ? `@${user.username}` : user.name;
    message += `${medal} ${display}\n📨 ${user.messages} | 🎭 ${user.stickers} | ⭐ ${user.points}\n\n`;
  });
  
  bot.sendMessage(msg.chat.id, message);
});

bot.onText(/\/stats/, (msg) => {
  const userId = msg.from.id.toString();
  const user = users.get(userId);
  
  if (!user) {
    return bot.sendMessage(msg.chat.id, '📊 No stats yet! Send some messages first.');
  }
  
  const display = user.username ? `@${user.username}` : user.name;
  const message = `📊 YOUR STATS 📊\n\n${display}\n📨 ${user.messages} messages\n🎭 ${user.stickers} stickers\n⭐ ${user.messages + user.stickers} points`;
  
  bot.sendMessage(msg.chat.id, message);
});

// Health check for Render with keep-alive
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.json({
  status: 'active',
  uptime: Math.floor(process.uptime()),
  users: users.size,
  timestamp: new Date().toISOString()
}));

app.get('/health', (req, res) => res.json({ status: 'ok', users: users.size }));

app.get('/ping', (req, res) => {
  console.log('🏓 Keep-alive ping received');
  res.json({ pong: true, time: new Date().toISOString() });
});

// KEEP-ALIVE SYSTEM - Prevents Render from sleeping
function keepAlive() {
  const url = 'https://chomer-tracker-bot.onrender.com';
  
  setInterval(async () => {
    try {
      const response = await fetch(`${url}/ping`);
      console.log('🔄 Keep-alive ping successful');
    } catch (error) {
      console.log('⚠️ Keep-alive ping failed');
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}

app.listen(port, () => {
  console.log(`✅ Bot ready on port ${port}`);
  console.log('✅ Telegram bot active');
  console.log('🔄 Keep-alive system starting...');
  
  // Start keep-alive after 1 minute
  setTimeout(() => {
    if (process.env.NODE_ENV === 'production') {
      keepAlive();
    }
  }, 60000);
});

// Error handling
bot.on('error', console.error);
bot.on('polling_error', console.error);