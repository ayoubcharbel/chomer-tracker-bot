# 🚀 Quick Deployment Guide

## The Problem
Your bot only works when your computer is on. To work 24/7, it needs to run on a server.

## 🎯 Easiest Solution: Railway (Free)

### Step 1: Prepare Your Code
```bash
./github_setup.sh
```

### Step 2: Upload to GitHub
1. Go to [github.com](https://github.com) and create a new repository
2. Copy the repository URL
3. Run:
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your bot repository
5. **Done!** Your bot is now running 24/7

### Step 4: Test
- Send `/start` in your Telegram group
- Try `/leaderboard`
- Send some messages to earn points

## 🆘 If Railway Doesn't Work

### Alternative 1: Render.com
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create "Web Service"
4. Build: `pip install -r requirements.txt`
5. Start: `python bot.py`

### Alternative 2: VPS (More Control)
```bash
# On your Ubuntu VPS
./deploy_vps.sh
```

## ✅ Success Checklist
- [ ] Bot responds to `/start`
- [ ] Leaderboard shows with `/leaderboard`
- [ ] Points increase when you send messages
- [ ] Bot works even when your computer is off

## 🔧 Troubleshooting
1. **Bot not responding**: Check hosting platform logs
2. **"Unauthorized" error**: Verify bot token in config.py
3. **Commands not working**: Make sure bot is admin in group
4. **Database issues**: Platform will create SQLite automatically

## 💡 Pro Tip
Railway automatically detects your `Procfile` and starts your bot. No additional configuration needed!

**Total setup time: 5-10 minutes** ⏰