# 🔒 Environment Variables Setup

## Why Use Environment Variables?

✅ **Security**: Keep sensitive data out of code  
✅ **Flexibility**: Easy configuration changes  
✅ **Best Practice**: Industry standard approach  
✅ **Cloud Ready**: Works seamlessly with hosting platforms  

## 🔧 Local Development Setup

### 1. Create .env file
```bash
cp .env.example .env
```

### 2. Edit .env with your values
```bash
# Open .env file and replace with your actual values
BOT_TOKEN=8396087536:AAEAOa6XjjpJ-sneI8L09wKMisnad-StdJg
DATABASE_NAME=user_activity.db
POINTS_PER_MESSAGE=1
POINTS_PER_STICKER=1
MAX_LEADERBOARD_ENTRIES=10
ENV=development
```

### 3. Install python-dotenv
```bash
pip install python-dotenv
```

## ☁️ Cloud Deployment (Render.com)

### Set Environment Variables in Render:

1. **Go to your service settings**
2. **Click "Environment" tab**  
3. **Add these variables**:

```
BOT_TOKEN = 8396087536:AAEAOa6XjjpJ-sneI8L09wKMisnad-StdJg
DATABASE_NAME = user_activity.db
POINTS_PER_MESSAGE = 1
POINTS_PER_STICKER = 1
MAX_LEADERBOARD_ENTRIES = 10
ENV = production
```

4. **Click "Save Changes"**
5. **Redeploy** your service

## 🧪 Testing Configuration

### Test locally:
```bash
python -c "from config import BOT_TOKEN; print('✅ Bot token loaded:', len(BOT_TOKEN) > 20)"
```

### Test all variables:
```bash
python -c "import config; print(f'Points per message: {config.POINTS_PER_MESSAGE}'); print(f'Environment: {config.ENV}')"
```

## 🔐 Security Benefits

- **No tokens in code**: Your bot token never appears in GitHub
- **Easy rotation**: Change tokens without code updates  
- **Environment specific**: Different configs for dev/prod
- **Team friendly**: Each developer has their own .env

## 📝 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_TOKEN` | *Required* | Your Telegram bot token |
| `DATABASE_NAME` | `user_activity.db` | SQLite database filename |
| `POINTS_PER_MESSAGE` | `1` | Points awarded per message |
| `POINTS_PER_STICKER` | `1` | Points awarded per sticker |
| `MAX_LEADERBOARD_ENTRIES` | `10` | Users shown in leaderboard |
| `ENV` | `production` | Environment type |

## 🚨 Important Notes

- ✅ `.env` is in `.gitignore` - won't be committed
- ✅ Use `.env.example` as template
- ✅ Set variables in Render dashboard for production
- ❌ Never commit actual `.env` file to git
- ❌ Never share your bot token publicly

This approach makes your bot more secure and professional! 🛡️