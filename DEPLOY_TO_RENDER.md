# 🚀 Deploy to Render - Step by Step Guide

## ✅ Prerequisites
- ✅ Bot working locally
- ✅ GitHub account
- ✅ Render account (free)

## 📂 Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Working Chomer Tracker Bot - Simple Version"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub.com
   - Click "New repository"
   - Name: `chomer-tracker-bot`
   - Make it **Public** (for free Render deployment)
   - Don't initialize with files

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOURUSERNAME/chomer-tracker-bot.git
   git branch -M main
   git push -u origin main
   ```

## 🔧 Step 2: Deploy on Render

1. **Go to render.com** and sign up/login

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select your `chomer-tracker-bot` repository
   - Click "Connect"

3. **Configure Settings**:
   - **Name**: `chomer-tracker-bot`
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node simple-start.js`

4. **Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
     ```
     TELEGRAM_BOT_TOKEN = 8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg
     NODE_ENV = production
     ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

## ✅ Step 3: Verify Deployment

1. **Check Logs**:
   - In Render dashboard, click on your service
   - Go to "Logs" tab
   - Look for: "✅ Bot started successfully"

2. **Test Bot**:
   - Go to your Telegram group
   - Send `/start` - should respond
   - Send regular messages - should track points
   - Send `/leaderboard` - should show activity

## 🎉 Success!

Once deployed, your bot will run 24/7 and track all group activity automatically!

## 🔄 Future Updates

To update the bot:
1. Make changes locally
2. Test locally
3. Push to GitHub: `git push`
4. Render will auto-deploy the changes

## 🆘 Troubleshooting

If deployment fails:
- Check Render logs for errors
- Verify environment variables are set
- Ensure GitHub repository is public
- Check bot token is correct