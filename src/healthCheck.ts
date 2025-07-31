import express from 'express';
import { prisma } from './database';
import logger from './logger';
import { config } from './config';

const app = express();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Readiness probe
app.get('/ready', async (req, res) => {
  try {
    // More comprehensive readiness check
    await prisma.$queryRaw`SELECT COUNT(*) FROM "users"`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Basic stats endpoint (for debugging)
app.get('/stats', async (req, res) => {
  try {
    const [userCount, messageCount, dailyStatsCount] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.dailyStats.count(),
    ]);

    res.status(200).json({
      users: userCount,
      messages: messageCount,
      dailyStats: dailyStatsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Stats endpoint failed:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      timestamp: new Date().toISOString(),
    });
  }
});

export function startHealthServer(): void {
  const port = config.app.port;
  
  app.listen(port, () => {
    logger.info(`Health check server running on port ${port}`);
  });
}

// For testing
export { app };