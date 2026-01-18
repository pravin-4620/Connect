#!/bin/bash

# Script to run Prisma migrations on Render database from local machine

echo "🔧 Running Prisma migrations on Render database..."
echo ""

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: DATABASE_URL not provided"
    echo ""
    echo "Usage: ./run-remote-migrations.sh 'your-database-url'"
    echo ""
    echo "Get your DATABASE_URL from:"
    echo "1. Go to Render → Your service → Environment"
    echo "2. Copy the DATABASE_URL value"
    echo ""
    exit 1
fi

DATABASE_URL=$1

echo "📊 Running migrations..."
cd backend
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
    echo ""
    echo "📝 Seeding database..."
    DATABASE_URL="$DATABASE_URL" npm run prisma:seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully!"
        echo ""
        echo "🎉 All done! Your database is ready."
    else
        echo "❌ Seeding failed. Check the error above."
        exit 1
    fi
else
    echo "❌ Migration failed. Check the error above."
    exit 1
fi
