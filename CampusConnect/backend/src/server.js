import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import placementRoutes from './routes/placement.routes.js';
import adminRoutes from './routes/admin.routes.js';
import chatRoutes from './routes/chat.routes.js';
import mailRoutes from './routes/mail.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import bugReportRoutes from './routes/bugReport.routes.js';
import { setupSocketHandlers } from './services/chat.service.js';
import { startEmailSyncJob } from './jobs/email-sync.job.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAllowedOriginsForLog, isAllowedOrigin } from './config/origins.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) return callback(null, true);
            return callback(new Error(`CORS blocked origin: ${origin}`));
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Note: File uploads now handled by Cloudinary (cloud storage)

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'CampusConnect API Server',
        version: '1.0.0',
        status: 'running'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bug-reports', bugReportRoutes);

// Public check endpoint (no auth required)
app.get("/check", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                profilePicture: true,
                isBlocked: true,
                createdAt: true,
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Check endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});



// Setup Socket.io handlers
setupSocketHandlers(io);

// Start cron jobs
startEmailSyncJob(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 Allowed frontend origins: ${getAllowedOriginsForLog().join(', ') || '(none configured)'}`);
});

export default app;
