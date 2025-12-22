#!/bin/bash

# Script to run both frontend and backend

echo "🚀 Starting CampusConnect..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb/brew/mongodb-community@7.0
    sleep 2
fi

# Start backend in background
echo "📡 Starting Backend Server..."
cd backend && node server.js &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd ../frontend && npm start

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM
