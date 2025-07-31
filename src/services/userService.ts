import { PrismaClient } from '@prisma/client';
import { UserData } from '../types';
import logger from '../logger';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async upsertUser(userData: UserData): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { id: userData.id },
        update: {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.fullName,
          updatedAt: new Date(),
        },
        create: {
          id: userData.id,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.fullName,
        },
      });
      
      logger.debug(`User upserted: ${userData.fullName} (${userData.id})`);
    } catch (error) {
      logger.error('Error upserting user:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.user.findMany({
        where: { isActive: true },
        orderBy: { joinedAt: 'asc' },
      });
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  async markUserInactive(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      
      logger.info(`User marked as inactive: ${userId}`);
    } catch (error) {
      logger.error('Error marking user inactive:', error);
      throw error;
    }
  }
}