#!/usr/bin/env python3
"""
Quick test script to verify bot functionality
"""

import requests
from config import BOT_TOKEN

def test_bot():
    """Test bot connectivity"""
    try:
        # Test bot token
        response = requests.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getMe")
        
        if response.status_code == 200:
            bot_info = response.json()['result']
            print("✅ Bot token valid!")
            print(f"📱 Bot name: {bot_info['first_name']}")
            print(f"🔗 Bot username: @{bot_info['username']}")
            print(f"🤖 Bot ID: {bot_info['id']}")
            return True
        else:
            print("❌ Bot token invalid!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing bot: {e}")
        return False

def check_database():
    """Check database functionality"""
    try:
        import database
        database.init_database()
        total_users = database.get_total_users()
        print(f"📊 Database working! Users tracked: {total_users}")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing bot components...\n")
    
    bot_ok = test_bot()
    db_ok = check_database()
    
    print("\n" + "="*50)
    if bot_ok and db_ok:
        print("🎉 All systems ready for deployment!")
        print("\n🚀 Next steps:")
        print("1. Push code to GitHub")
        print("2. Deploy to Render.com")
        print("3. Test with /start in your Telegram group")
    else:
        print("⚠️  Fix issues before deploying")