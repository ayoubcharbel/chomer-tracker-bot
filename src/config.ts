import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg',
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/chomer_tracker',
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  points: {
    perMessage: parseInt(process.env.POINTS_PER_MESSAGE || '1'),
    perSticker: parseInt(process.env.POINTS_PER_STICKER || '2'),
  },
};

// Validate required environment variables
if (!config.telegram.botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}