# 🔧 Bot Troubleshooting Guide

## Common Issues & Solutions

### 1. Bot Not Responding to Commands

**Symptoms:** Bot appears online but doesn't respond to `/start`, `/help`, or `/leaderboard`

**Possible Causes & Solutions:**

#### A. Bot Token Issues
```bash
# Test the bot token
npm run test:bot
```
- ❌ If fails: Double-check `TELEGRAM_BOT_TOKEN` environment variable
- ✅ If passes: Token is valid, continue to next step

#### B. Bot Permissions
1. **Make bot an admin** in your group:
   - Go to group settings → Administrators
   - Add your bot as administrator
   - ⚠️ **CRITICAL**: Enable "Delete messages" and "Restrict members" permissions

2. **Check group privacy settings**:
   - Bot must be admin to read all messages in groups
   - In supergroups, bot needs admin rights

#### C. Bot Setup in Group
```bash
# Test with simple bot first
npm run test:simple
```
1. Add bot to group as admin
2. Send `/start` command
3. Should get immediate response

### 2. Database Connection Issues

**Symptoms:** Bot responds but leaderboard shows errors or empty results

**Solutions:**
1. Check `DATABASE_URL` environment variable
2. Ensure database is running and accessible
3. Run database migration:
   ```bash
   npm run db:push
   ```

### 3. Environment Variable Issues

**Check these variables are set:**
- `TELEGRAM_BOT_TOKEN` ✅
- `DATABASE_URL` ✅
- `NODE_ENV=production` ✅

**In Render Dashboard:**
1. Go to your service
2. Click "Environment" tab
3. Verify all variables are set correctly

### 4. Deployment Issues

#### A. Build Failures
```bash
# Check build locally
npm run build
```

#### B. Start Command Issues
- Ensure `npm start` works locally
- Check Render logs for startup errors

#### C. Health Check Failures
- Visit: `https://your-app.onrender.com/health`
- Should return JSON with status "healthy"

### 5. Step-by-Step Debug Process

#### Step 1: Test Bot Token
```bash
npm run test:bot
```
Expected output: ✅ Bot token valid!

#### Step 2: Test Simple Bot
```bash
npm run test:simple
```
1. Should start without errors
2. Add to group as admin
3. Send `/ping` - should respond immediately

#### Step 3: Check Group Setup
1. Bot must be **admin** in group
2. Group type should be "group" or "supergroup"
3. Privacy mode should be **disabled** for the bot

#### Step 4: Test Commands
In your group, try:
- `/start` - Should show welcome message
- `/test` - Should respond "Test successful!"
- `/ping` - Should show response time
- `/info` - Should show bot information

#### Step 5: Full Bot Test
If simple bot works, try the full bot:
```bash
npm run dev
```

### 6. Render-Specific Issues

#### A. Environment Variables
1. In Render dashboard → Environment
2. Required variables:
   ```
   TELEGRAM_BOT_TOKEN=8068971149:AAETb7h7-Dxmf6d3aMH2BxWP5l_xcEcaqMg
   DATABASE_URL=(auto-filled from PostgreSQL service)
   NODE_ENV=production
   ```

#### B. Service Logs
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

#### C. Database Connection
1. Ensure PostgreSQL service is running
2. Check database URL is correctly linked
3. Database should auto-migrate on deploy

### 7. Quick Fixes

#### Reset Bot Commands
```javascript
// Add this to your bot temporarily
await bot.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help information' },
  { command: 'leaderboard', description: 'Show leaderboard' },
]);
```

#### Force Database Sync
```bash
npm run db:push
```

#### Clear Bot Webhook (if needed)
```javascript
await bot.deleteWebHook();
```

### 8. Testing Checklist

- [ ] Bot token is valid (`npm run test:bot`)
- [ ] Bot responds to simple commands (`npm run test:simple`)
- [ ] Bot is admin in the group
- [ ] Group privacy settings allow bot to read messages
- [ ] Database connection works
- [ ] Environment variables are set correctly
- [ ] Health endpoint returns 200 OK
- [ ] Render logs show no errors

### 9. Get Help

If issues persist, check:
1. **Render Logs**: Look for specific error messages
2. **Bot Logs**: Check application logs for errors
3. **Database Logs**: Verify database connectivity
4. **Health Endpoint**: `https://your-app.onrender.com/health`

### 10. Emergency Simple Bot

If nothing works, deploy the simple bot first:
1. Change `package.json` start script to: `"start": "tsx src/simpleBot.ts"`
2. Redeploy
3. Test basic functionality
4. Once working, switch back to full bot