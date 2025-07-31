import { PrismaClient } from '@prisma/client';
import { StatsData, LeaderboardEntry, MessageType } from '../types';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { config } from '../config';
import logger from '../logger';

export class StatsService {
  constructor(private prisma: PrismaClient) {}

  async updateDailyStats(userId: string, date: Date = new Date()): Promise<void> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    try {
      // Get message counts for the day
      const [messageCount, stickerCount] = await Promise.all([
        this.prisma.message.count({
          where: {
            userId,
            timestamp: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.message.count({
          where: {
            userId,
            messageType: MessageType.STICKER,
            timestamp: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      const totalPoints = (messageCount * config.points.perMessage) + (stickerCount * config.points.perSticker);

      await this.prisma.dailyStats.upsert({
        where: {
          userId_date: {
            userId,
            date: dayStart,
          },
        },
        update: {
          messageCount,
          stickerCount,
          totalPoints,
        },
        create: {
          userId,
          date: dayStart,
          messageCount,
          stickerCount,
          totalPoints,
        },
      });

      logger.debug(`Daily stats updated for user ${userId}: ${messageCount} messages, ${stickerCount} stickers, ${totalPoints} points`);
    } catch (error) {
      logger.error('Error updating daily stats:', error);
      throw error;
    }
  }

  async updateWeeklyStats(userId: string, date: Date = new Date()): Promise<void> {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    try {
      const [messageCount, stickerCount] = await Promise.all([
        this.prisma.message.count({
          where: {
            userId,
            timestamp: { gte: weekStart, lte: weekEnd },
          },
        }),
        this.prisma.message.count({
          where: {
            userId,
            messageType: MessageType.STICKER,
            timestamp: { gte: weekStart, lte: weekEnd },
          },
        }),
      ]);

      const totalPoints = (messageCount * config.points.perMessage) + (stickerCount * config.points.perSticker);

      await this.prisma.weeklyStats.upsert({
        where: {
          userId_weekStart: {
            userId,
            weekStart,
          },
        },
        update: {
          messageCount,
          stickerCount,
          totalPoints,
        },
        create: {
          userId,
          weekStart,
          messageCount,
          stickerCount,
          totalPoints,
        },
      });

      logger.debug(`Weekly stats updated for user ${userId}: ${messageCount} messages, ${stickerCount} stickers, ${totalPoints} points`);
    } catch (error) {
      logger.error('Error updating weekly stats:', error);
      throw error;
    }
  }

  async updateMonthlyStats(userId: string, date: Date = new Date()): Promise<void> {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    try {
      const [messageCount, stickerCount] = await Promise.all([
        this.prisma.message.count({
          where: {
            userId,
            timestamp: { gte: monthStart, lte: monthEnd },
          },
        }),
        this.prisma.message.count({
          where: {
            userId,
            messageType: MessageType.STICKER,
            timestamp: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      const totalPoints = (messageCount * config.points.perMessage) + (stickerCount * config.points.perSticker);

      await this.prisma.monthlyStats.upsert({
        where: {
          userId_monthStart: {
            userId,
            monthStart,
          },
        },
        update: {
          messageCount,
          stickerCount,
          totalPoints,
        },
        create: {
          userId,
          monthStart,
          messageCount,
          stickerCount,
          totalPoints,
        },
      });

      logger.debug(`Monthly stats updated for user ${userId}: ${messageCount} messages, ${stickerCount} stickers, ${totalPoints} points`);
    } catch (error) {
      logger.error('Error updating monthly stats:', error);
      throw error;
    }
  }

  async updateAllStats(userId: string, date: Date = new Date()): Promise<void> {
    await Promise.all([
      this.updateDailyStats(userId, date),
      this.updateWeeklyStats(userId, date),
      this.updateMonthlyStats(userId, date),
    ]);
  }

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time', limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      let results: any[] = [];

      if (period === 'all-time') {
        // Calculate all-time stats from message counts
        results = await this.prisma.user.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
            messages: {
              where: {
                messageType: MessageType.STICKER,
              },
              select: {
                id: true,
              },
            },
          },
          take: limit,
        });

        return results.map((user, index) => ({
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          messageCount: user._count.messages,
          stickerCount: user.messages.length,
          totalPoints: (user._count.messages * config.points.perMessage) + (user.messages.length * config.points.perSticker),
          rank: index + 1,
        }));
      } else {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'daily':
            startDate = startOfDay(now);
            results = await this.prisma.dailyStats.findMany({
              where: { date: startDate },
              include: { user: true },
              orderBy: { totalPoints: 'desc' },
              take: limit,
            });
            break;
          case 'weekly':
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            results = await this.prisma.weeklyStats.findMany({
              where: { weekStart: startDate },
              include: { user: true },
              orderBy: { totalPoints: 'desc' },
              take: limit,
            });
            break;
          case 'monthly':
            startDate = startOfMonth(now);
            results = await this.prisma.monthlyStats.findMany({
              where: { monthStart: startDate },
              include: { user: true },
              orderBy: { totalPoints: 'desc' },
              take: limit,
            });
            break;
        }

        return results.map((stat, index) => ({
          userId: stat.user.id,
          username: stat.user.username,
          fullName: stat.user.fullName,
          messageCount: stat.messageCount,
          stickerCount: stat.stickerCount,
          totalPoints: stat.totalPoints,
          rank: index + 1,
        }));
      }
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }
}