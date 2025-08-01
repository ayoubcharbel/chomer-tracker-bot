// PM2 ecosystem config for production
module.exports = {
  apps: [{
    name: 'chomer-tracker-bot',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TELEGRAM_BOT_TOKEN: '8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};