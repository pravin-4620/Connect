# CampusConnect - Campus Management System

A comprehensive full-stack campus management system with role-based interfaces for Students, Mentors, Placement Officers, and Admins.

## Tech Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.io
- **AI**: OpenAI API
- **Email**: Gmail API with OAuth 2.0
- **Storage**: AWS S3

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Charts**: Recharts
- **Real-time**: Socket.io Client

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Gmail API credentials (for email integration)
- OpenAI API key (for AI features)
- AWS S3 bucket (for file storage)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Generate a secure random string
   - `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`: From Google Cloud Console
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `AWS_*`: Your AWS credentials and bucket name

4. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb campusconnect
   ```

5. **Run Prisma migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

7. **Seed database (optional)**
   ```bash
   npm run prisma:seed
   ```

8. **Start development server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   App will run on `http://localhost:3000`

## Project Structure

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js               # Seed data
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── mentor.controller.js
│   │   ├── placement.controller.js
│   │   └── admin.controller.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── routes/              # API routes
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── mentor.routes.js
│   │   ├── placement.routes.js
│   │   ├── admin.routes.js
│   │   └── chat.routes.js
│   ├── services/            # Business logic
│   │   ├── chat.service.js
│   │   ├── gmail.service.js
│   │   ├── openai.service.js
│   │   └── upload.service.js
│   ├── jobs/                # Cron jobs
│   │   └── email-sync.job.js
│   └── server.js            # Entry point
├── .env
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── context/            # React context
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── student/
│   │   ├── mentor/
│   │   ├── placement/
│   │   ├── admin/
│   │   └── Chat.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useDebounce.js
│   ├── App.jsx
│   └── index.jsx
├── .env
└── package.json
```

## Features by Role

### Student
- View dashboard with stats (CGPA, assignments, events, placements)
- Apply for placement drives (eligibility-based)
- Register for events
- Submit assignments
- Upload and analyze resume (AI-powered)
- View categorized emails (Gmail integration)
- Chat with mentor and placement officer (year 3-4 only)
- Apply for gate passes
- Take skills tests
- Access study materials

### Mentor
- View assigned students
- Create and manage events
- Upload study materials
- Create assignments
- Grade submissions
- Approve/reject gate passes
- Approve/reject event registrations
- Chat with assigned students
- View student analytics

### Placement Officer
- Create placement drives with eligibility criteria
- View eligible students (year 3-4)
- Schedule interviews
- Create skills tests
- View placement analytics
- Create announcements
- Chat with year 3-4 students
- Export reports

### Admin
- Create user accounts (auto-generate credentials)
- Assign students to mentors
- Assign students to placement officers (year 3-4 only)
- View system-wide statistics
- Manage user roles

## API Endpoints

### Authentication
- `POST /api/auth/login` - Student/Mentor/Placement login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/gmail-connect` - Initiate Gmail OAuth
- `GET /api/auth/gmail-callback` - Gmail OAuth callback
- `GET /api/auth/profile` - Get current user profile

### Student
- `GET /api/student/dashboard` - Dashboard stats
- `PUT /api/student/profile` - Update profile
- `GET /api/student/placements` - Get eligible placements
- `POST /api/student/placements/:id/apply` - Apply for placement
- `GET /api/student/events` - Get events
- `POST /api/student/events/:id/register` - Register for event
- `GET /api/student/assignments` - Get assignments
- `POST /api/student/assignments/:id/submit` - Submit assignment
- `GET /api/student/study-materials` - Get study materials
- `GET /api/student/skills-tests` - Get available tests
- `POST /api/student/skills-tests/:id/attempt` - Attempt test
- `POST /api/student/resume/analyze` - Analyze resume
- `GET /api/student/emails` - Get categorized emails
- `POST /api/student/gate-pass` - Apply for gate pass

### Mentor
- `GET /api/mentor/dashboard` - Dashboard stats
- `GET /api/mentor/students` - Get assigned students
- `GET /api/mentor/students/:id` - Get student details
- `POST /api/mentor/events` - Create event
- `PUT /api/mentor/events/:id` - Update event
- `DELETE /api/mentor/events/:id` - Delete event
- `GET /api/mentor/approvals` - Get pending approvals
- `PUT /api/mentor/approvals/:id` - Approve/reject
- `POST /api/mentor/study-materials` - Upload material
- `POST /api/mentor/assignments` - Create assignment
- `PUT /api/mentor/assignments/:id/grade` - Grade submission

### Placement Officer
- `GET /api/placement/dashboard` - Dashboard stats
- `POST /api/placement/drives` - Create placement drive
- `PUT /api/placement/drives/:id` - Update drive
- `GET /api/placement/students` - Get eligible students
- `POST /api/placement/interviews` - Schedule interview
- `POST /api/placement/skills-tests` - Create test
- `GET /api/placement/analytics` - Get analytics
- `POST /api/placement/announcements` - Create announcement

### Admin
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - Get all users
- `POST /api/admin/mappings` - Create student mapping
- `PUT /api/admin/mappings/:id` - Update mapping
- `GET /api/admin/statistics` - System statistics

### Chat
- `GET /api/chat/conversations` - Get conversations
- `GET /api/chat/messages/:conversationId` - Get messages
- `POST /api/chat/messages` - Send message
- `PUT /api/chat/messages/:id/read` - Mark as read

## Access Control Rules

1. **Students (Year 1-2)**
   - Can chat with mentor only
   - Cannot access placement features
   - No placement officer assigned

2. **Students (Year 3-4)**
   - Can chat with mentor and placement officer
   - Can access placement features
   - Must have placement officer assigned

3. **Mentors**
   - Can only see assigned students
   - Can approve gate passes and event registrations

4. **Placement Officers**
   - Can only see year 3-4 students
   - Can create placement drives and tests

5. **Admin**
   - Full system access
   - Can create users and manage mappings

## Development Tools

### Prisma Studio
View and edit database data:
```bash
npm run prisma:studio
```

### API Testing
Use Postman or Thunder Client with the provided collection (coming soon).

## Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Start server: `npm start`

### Frontend (Vercel/Netlify)
1. Set environment variables
2. Build: `npm run build`
3. Deploy build folder

## License
MIT

## Support
For issues and questions, please create an issue in the repository.
