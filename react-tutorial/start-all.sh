#!/bin/bash

# CampusConnect Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 CampusConnect Platform - Quick Start"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup EXIT INT TERM

# Start Backend
echo "📦 Starting Backend Server..."
cd "$(dirname "$0")/backend"
PORT=5001 node server.js > /tmp/campusconnect-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on port 5001"

# Wait for backend to be ready
sleep 3

# Start Frontend
echo "⚛️  Starting Frontend Server..."
cd "$(dirname "$0")/frontend"
npm start > /tmp/campusconnect-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) on port 3000"

# Wait for frontend to be ready
sleep 10

echo ""
echo "🎉 CampusConnect is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:5001"
echo ""
echo "📝 Backend Log: tail -f /tmp/campusconnect-backend.log"
echo "📝 Frontend Log: tail -f /tmp/campusconnect-frontend.log"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Wait for all processes
wait
