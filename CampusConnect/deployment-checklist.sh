#!/bin/bash

# CampusConnect - Quick Deployment Checklist

echo "🚀 CampusConnect Deployment Checklist"
echo "======================================"
echo ""

# Check if git is initialized
if [ -d .git ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ Git repository not initialized"
    echo "   Run: git init && git add . && git commit -m 'Initial commit'"
fi

# Check if backend .env.example exists
if [ -f backend/.env.example ]; then
    echo "✅ Backend .env.example exists"
else
    echo "❌ Backend .env.example missing"
fi

# Check if frontend .env.example exists
if [ -f frontend/.env.example ]; then
    echo "✅ Frontend .env.example exists"
else
    echo "❌ Frontend .env.example missing"
fi

# Check if DEPLOYMENT.md exists
if [ -f DEPLOYMENT.md ]; then
    echo "✅ Deployment guide exists"
else
    echo "❌ Deployment guide missing"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Create a PostgreSQL database (Neon/Supabase/Railway)"
echo "2. Deploy backend to Render/Railway"
echo "3. Deploy frontend to Vercel"
echo "4. Update environment variables"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
echo ""

# Generate a JWT secret
echo "🔐 Generated JWT Secret (save this!):"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""
