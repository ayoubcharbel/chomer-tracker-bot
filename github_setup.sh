#!/bin/bash

echo "📱 Setting up GitHub repository for bot deployment..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repo if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
fi

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Bot specific
*.log
user_activity.db
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# Add all files
echo "📁 Adding files to repository..."
git add .

# Initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Telegram Activity Tracker Bot

Features:
- User activity tracking (messages & stickers)
- Persistent leaderboard system
- SQLite database storage
- Multiple deployment options
- 24/7 cloud hosting ready"

echo ""
echo "✅ Git repository set up successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Create a new repository on GitHub.com"
echo "2. Copy the repository URL (https://github.com/username/repo-name.git)"
echo "3. Run these commands:"
echo "   git remote add origin <your-repo-url>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy to Railway/Render using your GitHub repo!"
echo ""
echo "📖 See deploy_instructions.md for detailed hosting options"