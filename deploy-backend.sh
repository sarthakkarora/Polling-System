#!/bin/bash

echo "🚀 Deploying intervue.io poll Backend to Render"

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: server/package.json not found. Make sure you're in the project root."
    exit 1
fi

echo "✅ Project structure looks good"
echo "📋 Next steps:"
echo "1. Go to https://render.com and sign up with GitHub"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect this repository: sarthakkarora/Polling-System"
echo "4. Use these settings:"
echo "   - Name: intervue-io-poll-backend"
echo "   - Root Directory: server"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "5. Add Environment Variables:"
echo "   - PORT: 10000"
echo "   - CLIENT_URL: https://your-vercel-app.vercel.app"
echo "   - NODE_ENV: production"
echo ""
echo "🎯 After deployment, update your Vercel app's environment variable:"
echo "   REACT_APP_SERVER_URL=https://your-render-app.onrender.com"
