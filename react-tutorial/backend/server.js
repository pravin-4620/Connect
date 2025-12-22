const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? 
  [process.env.FRONTEND_URL, 'http://localhost:3000'] : 
  ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CampusConnect API' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/companies', require('./routes/companyDriveRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// New comprehensive routes
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/mentor-assignments', require('./routes/mentorAssignmentRoutes'));
app.use('/api/assignments', require('./routes/resourceRoutes'));

// New feature routes
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Store online users
const onlineUsers = new Map();

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join user to their personal room for direct messages
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined personal room`);
    
    // Broadcast online status
    io.emit('user-online', { userId, online: true });
  });

  // Join user to room by role for targeted broadcasts
  socket.on('join-role', (role) => {
    socket.join(role);
    console.log(`✅ User ${socket.id} joined room: ${role}`);
  });

  // Join conversation room for real-time messaging
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`💬 User ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    socket.to(`conversation_${conversationId}`).emit('user-typing', {
      conversationId,
      userId,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    // Find and remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user-online', { userId, online: false });
        break;
      }
    }
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless
module.exports = app;
