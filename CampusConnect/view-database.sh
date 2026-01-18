#!/bin/bash

# Script to open Prisma Studio for your production database

echo "🔍 Opening Prisma Studio for production database..."
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: DATABASE_URL not provided"
    echo ""
    echo "Usage: ./view-database.sh 'your-database-url'"
    echo ""
    echo "Get your DATABASE_URL from:"
    echo "1. Go to Render → Your service → Environment"
    echo "2. Copy the DATABASE_URL value"
    echo ""
    echo "Example:"
    echo "./view-database.sh 'postgresql://user:pass@host:5432/db'"
    echo ""
    exit 1
fi

DATABASE_URL=$1

echo "📊 Starting Prisma Studio..."
echo "This will open in your browser at http://localhost:5555"
echo ""
echo "Press Ctrl+C to stop Prisma Studio"
echo ""

cd backend
DATABASE_URL="$DATABASE_URL" npx prisma studio
