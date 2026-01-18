#!/bin/bash

# Script to query your production database

echo "🔍 Querying production database..."
echo ""

if [ -z "$1" ]; then
    echo "❌ Error: DATABASE_URL not provided"
    echo ""
    echo "Usage: ./query-database.sh 'your-database-url' 'SQL-query'"
    echo ""
    echo "Example - Count all users:"
    echo "./query-database.sh 'postgresql://...' 'SELECT COUNT(*) FROM \"User\";'"
    echo ""
    echo "Example - View all users:"
    echo "./query-database.sh 'postgresql://...' 'SELECT * FROM \"User\";'"
    echo ""
    exit 1
fi

DATABASE_URL=$1
QUERY=${2:-"SELECT table_name FROM information_schema.tables WHERE table_schema='public';"}

echo "📊 Running query: $QUERY"
echo ""

cd backend
DATABASE_URL="$DATABASE_URL" npx prisma db execute --stdin <<< "$QUERY"
