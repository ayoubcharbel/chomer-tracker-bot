import { PrismaClient } from '@prisma/client';
import { MessageData, MessageType } from '../types';
import logger from '../logger';

export class MessageService {
  constructor(private prisma: PrismaClient) {}

  async recordMessage(messageData: MessageData): Promise<void> {
    try {
      await this.prisma.message.create({
        data: {
          userId: messageData.userId,
          messageId: messageData.messageId,
          chatId: messageData.chatId,
          content: messageData.content,
          messageType: messageData.messageType,
          timestamp: messageData.timestamp,
        },
      });
      
      logger.debug(`Message recorded: ${messageData.messageType} from user ${messageData.userId}`);
    } catch (error) {
      logger.error('Error recording message:', error);
      throw error;
    }
  }

  async getMessagesByUser(userId: string, limit?: number) {
    try {
      return await this.prisma.message.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error getting messages by user:', error);
      throw error;
    }
  }

  async getMessagesByDateRange(startDate: Date, endDate: Date) {
    try {
      return await this.prisma.message.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: true,
        },
        orderBy: { timestamp: 'desc' },
      });
    } catch (error) {
      logger.error('Error getting messages by date range:', error);
      throw error;
    }
  }

  async getTotalMessagesByUser(userId: string): Promise<number> {
    try {
      return await this.prisma.message.count({
        where: { userId },
      });
    } catch (error) {
      logger.error('Error getting total messages by user:', error);
      throw error;
    }
  }

  async getTotalStickersByUser(userId: string): Promise<number> {
    try {
      return await this.prisma.message.count({
        where: {
          userId,
          messageType: MessageType.STICKER,
        },
      });
    } catch (error) {
      logger.error('Error getting total stickers by user:', error);
      throw error;
    }
  }
}