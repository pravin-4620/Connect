# CampusConnect Backend API

RESTful API for CampusConnect campus management system.

## Tech Stack

- **Node.js** & **Express** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campusconnect
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

4. **Run the server:**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |

### Students (`/api/students`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Student | Create profile |
| GET | `/` | Mentor/Officer | Get all students |
| GET | `/me` | Student | Get own profile |
| GET | `/:id` | Private | Get student by ID |
| PUT | `/me` | Student | Update own profile |
| PUT | `/:id` | Mentor/Officer | Update student |
| DELETE | `/:id` | Officer | Delete student |

### Companies (`/api/companies`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Officer | Create company |
| GET | `/` | Private | Get all companies |
| GET | `/:id` | Private | Get company by ID |
| PUT | `/:id` | Officer | Update company |
| DELETE | `/:id` | Officer | Delete company |

### Jobs (`/api/jobs`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Officer | Create job |
| GET | `/` | Private | Get all jobs |
| GET | `/:id` | Private | Get job by ID |
| PUT | `/:id` | Officer | Update job |
| DELETE | `/:id` | Officer | Delete job |
| POST | `/:id/apply` | Student | Apply for job |
| PUT | `/:jobId/applications/:applicationId` | Mentor/Officer | Update application status |
| GET | `/student/applications` | Student | Get own applications |

## User Roles

- **student** - Students can manage profiles and apply for jobs
- **mentor** - Mentors can view students and manage applications
- **placement_officer** - Full access to all resources

## Authentication

Include JWT token in requests:
```
Authorization: Bearer <token>
```

## Example Requests

### Register User
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

### Create Student Profile
```bash
POST /api/students
Authorization: Bearer <token>
{
  "rollNumber": "CS2021001",
  "department": "Computer Science",
  "year": 3,
  "cgpa": 8.5,
  "phone": "1234567890",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

### Apply for Job
```bash
POST /api/jobs/:jobId/apply
Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── config/
│   └── database.js      # MongoDB connection
├── middleware/
│   └── auth.js          # JWT authentication
├── models/
│   ├── User.js          # User model
│   ├── Student.js       # Student model
│   ├── Company.js       # Company model
│   └── Job.js           # Job model
├── routes/
│   ├── authRoutes.js    # Auth endpoints
│   ├── studentRoutes.js # Student endpoints
│   ├── companyRoutes.js # Company endpoints
│   └── jobRoutes.js     # Job endpoints
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── server.js            # Entry point
```
