import TelegramBot from 'node-telegram-bot-api';
import { StatsService } from '../services/statsService';
import { formatLeaderboardMessage } from '../utils/messageUtils';
import logger from '../logger';

export class LeaderboardCommand {
  constructor(private statsService: StatsService) {}

  async handle(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const args = text.split(' ').slice(1); // Remove the command itself
    
    let period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time';
    
    if (args.length > 0) {
      const requestedPeriod = args[0].toLowerCase();
      if (['daily', 'weekly', 'monthly', 'all', 'all-time'].includes(requestedPeriod)) {
        period = requestedPeriod === 'all' ? 'all-time' : requestedPeriod as any;
      }
    }

    try {
      logger.info(`Generating ${period} leaderboard for chat ${chatId}`);
      
      const leaderboard = await this.statsService.getLeaderboard(period, 10);
      const message = formatLeaderboardMessage(leaderboard, period);
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
      
      logger.info(`Leaderboard sent successfully for period: ${period}`);
    } catch (error) {
      logger.error('Error generating leaderboard:', error);
      
      await bot.sendMessage(chatId, 
        '❌ Sorry, there was an error generating the leaderboard. Please try again later.',
        { parse_mode: 'Markdown' }
      );
    }
  }
}

export function setupLeaderboardCommand(bot: TelegramBot, statsService: StatsService): void {
  const leaderboardCommand = new LeaderboardCommand(statsService);
  
  bot.onText(/\/leaderboard(?:\s+(.+))?/, async (msg, match) => {
    await leaderboardCommand.handle(bot, msg);
  });
  
  logger.info('Leaderboard command setup complete');
}