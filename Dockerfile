# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npm run db:generate && npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port (though not used for the bot, good for health checks)
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001

# Change ownership of app directory
RUN chown -R botuser:nodejs /app
USER botuser

# Start the bot
CMD ["npm", "start"]