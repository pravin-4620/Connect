# CampusConnect

A modern, full-stack campus management system with real-time synchronization across Student, Mentor, and Placement Officer portals.

## 🚀 Features

### 👨‍🎓 Student Portal
- Browse and apply for placement opportunities
- Register for college events
- View application status with real-time updates
- Profile management with photo upload

### 👨‍🏫 Mentor Portal  
- View assigned students
- Review and approve/reject placement applications
- Review and approve/reject event registrations
- Real-time approval notifications

### 💼 Placement Officer Portal
- Manage companies database
- Create and manage placement opportunities
- Schedule placement drives
- Create and manage events
- View all applications
- Assign mentors to students

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Lucide React Icons
- Socket.io Client (Real-time)

### Backend
- Node.js / Express
- MongoDB / Mongoose
- JWT Authentication
- Socket.io (WebSocket)

## 📦 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/react-tutorial.git
cd react-tutorial
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Seed Database (Optional)
```bash
cd backend
node seed-data.js
```

## 🔐 Test Credentials

| Portal | Email | Password |
|--------|-------|----------|
| **Student** | student@test.com | password123 |
| **Mentor** | mentor@test.com | password123 |
| **Placement Officer** | officer@test.com | password123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Placements
- `GET /api/placements` - Get all placements
- `POST /api/placements` - Create placement (Officer)
- `POST /api/placements/:id/apply` - Apply for placement (Student)
- `GET /api/placements/applications/my` - Get my applications (Student)
- `GET /api/placements/applications` - Get all applications (Mentor/Officer)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (Officer)
- `POST /api/events/:id/register` - Register for event (Student)
- `GET /api/events/registrations/my` - Get my registrations (Student)

### Approvals
- `GET /api/approvals` - Get pending approvals (Mentor)
- `PUT /api/approvals/:id/approve` - Approve request (Mentor)
- `PUT /api/approvals/:id/reject` - Reject request (Mentor)

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (Officer)

## 🔄 Real-time Features

The application uses WebSockets for real-time synchronization:
- When a student applies for a placement, mentors see it instantly
- When a mentor approves/rejects, students see the update immediately
- When officer creates placements/events, they appear instantly for students

## 📁 Project Structure

```
├── backend/
│   ├── server.js           # Express server + WebSocket
│   ├── config/             # Database config
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── seed-data.js        # Database seeder
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main app component
│   │   ├── StudentDashboard.js    # Student portal
│   │   ├── MentorDashboard.js     # Mentor portal
│   │   ├── PlacementDashboard.js  # Officer portal
│   │   ├── components/            # Shared components
│   │   └── services/              # API & Socket services
│   └── public/
└── README.md
```

## 🧪 Testing the Flow

1. **Login as Student** (student@test.com / password123)
   - Go to "Placements" tab
   - Click "Apply Now" on any placement
   - Enter a reason and submit

2. **Login as Mentor** (mentor@test.com / password123)
   - Go to "Approvals" tab
   - See the student's application
   - Click "Review" then "Approve" or "Reject"

3. **Login as Student again**
   - Check your applications - status updated!

4. **Login as Officer** (officer@test.com / password123)
   - Create new placements/events
   - View all applications
   - Manage companies

## 📝 License

MIT License
