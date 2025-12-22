#!/usr/bin/env node

/**
 * Seed script for CampusConnect
 * Populates database with initial data for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Placement = require('./models/Placement');
const Event = require('./models/Event');
const Company = require('./models/Company');
const User = require('./models/User');
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const StudyResource = require('./models/StudyResource');
const MentorAssignment = require('./models/MentorAssignment');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Placement.deleteMany({});
    await Event.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Assignment.deleteMany({});
    await StudyResource.deleteMany({});
    await MentorAssignment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users (with hashed passwords)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'John Student',
        email: 'student@test.com',
        password: hashedPassword,
        role: 'student',
        isProfileComplete: true,
        mustChangePassword: false
      },
      {
        name: 'Jane Student',
        email: 'student2@test.com',
        password: hashedPassword,
        role: 'student',
        isProfileComplete: true,
        mustChangePassword: false
      },
      {
        name: 'Mike Student',
        email: 'student3@test.com',
        password: hashedPassword,
        role: 'student',
        isProfileComplete: true,
        mustChangePassword: false
      },
      {
        name: 'Dr. Sarah Mentor',
        email: 'mentor@test.com',
        password: hashedPassword,
        role: 'mentor',
        department: 'Computer Science',
        isProfileComplete: true,
        mustChangePassword: false
      },
      {
        name: 'Dr. Robert Guide',
        email: 'mentor2@test.com',
        password: hashedPassword,
        role: 'mentor',
        department: 'Information Technology',
        isProfileComplete: true,
        mustChangePassword: false
      },
      {
        name: 'Admin Officer',
        email: 'officer@test.com',
        password: hashedPassword,
        role: 'placement_officer',
        department: 'Placement Cell',
        isProfileComplete: true,
        mustChangePassword: false
      }
    ]);
    
    const studentUser1 = users[0];
    const studentUser2 = users[1];
    const studentUser3 = users[2];
    const mentorUser1 = users[3];
    const mentorUser2 = users[4];
    
    console.log(`✅ Created ${users.length} users`);

    // Create Student profiles
    const students = await Student.insertMany([
      {
        user: studentUser1._id,
        rollNumber: 'CS2021001',
        department: 'Computer Science',
        year: 4,
        cgpa: 8.5,
        phone: '9876543210',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        resume: 'resume_john.pdf'
      },
      {
        user: studentUser2._id,
        rollNumber: 'IT2021002',
        department: 'Information Technology',
        year: 3,
        cgpa: 7.8,
        phone: '9876543211',
        skills: ['Java', 'Spring Boot', 'MySQL']
      },
      {
        user: studentUser3._id,
        rollNumber: 'CS2021003',
        department: 'Computer Science',
        year: 4,
        cgpa: 9.0,
        phone: '9876543212',
        skills: ['Python', 'TensorFlow', 'Data Science']
      }
    ]);
    console.log(`✅ Created ${students.length} student profiles`);

    // Create Mentor Assignments
    const mentorAssignments = await MentorAssignment.insertMany([
      {
        mentor: mentorUser1._id,
        student: students[0]._id,
        user: studentUser1._id,
        status: 'Active'
      },
      {
        mentor: mentorUser1._id,
        student: students[2]._id,
        user: studentUser3._id,
        status: 'Active'
      },
      {
        mentor: mentorUser2._id,
        student: students[1]._id,
        user: studentUser2._id,
        status: 'Active'
      }
    ]);
    console.log(`✅ Created ${mentorAssignments.length} mentor assignments`);

    // Create Companies
    const companies = await Company.insertMany([
      {
        name: 'Google India',
        description: 'Google is an American multinational technology company.',
        industry: 'Technology',
        location: 'Bangalore',
        employeeCount: '1000+',
        website: 'https://www.google.co.in',
        email: 'university-recruiting@google.com',
        phone: '+91 80 6749 6000',
        status: 'Active',
        hiringRoles: ['Software Engineer', 'Product Manager', 'Data Analyst']
      },
      {
        name: 'Microsoft India',
        description: 'Microsoft is an American technology corporation.',
        industry: 'Technology',
        location: 'Hyderabad',
        employeeCount: '1000+',
        website: 'https://www.microsoft.com/en-in',
        email: 'university.recruiting@microsoft.com',
        phone: '+91 40 6737 2000',
        status: 'Active',
        hiringRoles: ['Cloud Engineer', 'Software Developer', 'Data Scientist']
      },
      {
        name: 'Amazon India',
        description: 'Amazon is an American e-commerce technology company.',
        industry: 'E-commerce & Cloud',
        location: 'Bangalore',
        employeeCount: '1000+',
        website: 'https://www.amazon.in',
        email: 'university-recruiting-india@amazon.com',
        phone: '+91 80 6178 6000',
        status: 'Active',
        hiringRoles: ['Software Development Engineer', 'Data Analyst', 'Operations']
      },
      {
        name: 'TCS',
        description: 'Tata Consultancy Services is an Indian IT services company.',
        industry: 'IT Services',
        location: 'Mumbai',
        employeeCount: '1000+',
        website: 'https://www.tcs.com',
        email: 'careers@tcs.com',
        phone: '+91 22 2560 0000',
        status: 'Active',
        hiringRoles: ['Systems Engineer', 'Software Developer', 'Consultant']
      },
      {
        name: 'Infosys',
        description: 'Infosys is an Indian multinational IT services company.',
        industry: 'IT Services',
        location: 'Bangalore',
        employeeCount: '1000+',
        website: 'https://www.infosys.com',
        email: 'careers@infosys.com',
        phone: '+91 80 4010 0000',
        status: 'Active',
        hiringRoles: ['Software Engineer', 'Application Developer', 'Specialist']
      }
    ]);
    console.log(`✅ Created ${companies.length} companies`);

    // Create Placements
    const placements = await Placement.insertMany([
      {
        company: companies[0].name,
        companyId: companies[0]._id,
        role: 'Software Engineer',
        package: '30 LPA',
        jobType: 'Full-time',
        mode: 'On-Campus',
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Open',
        eligibility: {
          minCGPA: 7.0,
          branches: ['CSE', 'IT', 'ECE'],
          year: ['3rd Year', '4th Year']
        },
        totalPositions: 20,
        description: 'Looking for talented software engineers to join our team'
      },
      {
        company: companies[1].name,
        companyId: companies[1]._id,
        role: 'Cloud Engineer',
        package: '32 LPA',
        jobType: 'Full-time',
        mode: 'On-Campus',
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Open',
        eligibility: {
          minCGPA: 7.5,
          branches: ['CSE', 'IT'],
          year: ['3rd Year', '4th Year']
        },
        totalPositions: 15,
        description: 'Microsoft is hiring Cloud Engineers for Azure platform'
      },
      {
        company: companies[0].name,
        companyId: companies[0]._id,
        role: 'Product Manager',
        package: '28 LPA',
        jobType: 'Full-time',
        mode: 'Virtual',
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'Open',
        eligibility: {
          minCGPA: 7.5,
          branches: ['All'],
          year: ['4th Year']
        },
        totalPositions: 5,
        description: 'Join Google as a Product Manager'
      },
      {
        company: companies[2].name,
        companyId: companies[2]._id,
        role: 'Data Analyst',
        package: '18 LPA',
        jobType: 'Full-time',
        mode: 'Hybrid',
        applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Closing Soon',
        eligibility: {
          minCGPA: 6.5,
          branches: ['All'],
          year: ['3rd Year', '4th Year']
        },
        totalPositions: 30,
        description: 'Amazon is hiring Data Analysts'
      },
      {
        company: companies[3].name,
        companyId: companies[3]._id,
        role: 'Systems Engineer',
        package: '15 LPA',
        jobType: 'Full-time',
        mode: 'On-Campus',
        applicationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'Closing Soon',
        eligibility: {
          minCGPA: 6.0,
          branches: ['CSE', 'IT'],
          year: ['3rd Year', '4th Year']
        },
        totalPositions: 40,
        description: 'TCS is hiring Systems Engineers'
      }
    ]);
    console.log(`✅ Created ${placements.length} placements`);

    // Create Events
    const events = await Event.insertMany([
      {
        title: 'Tech Workshop - React Fundamentals',
        description: 'Learn React basics and build your first app',
        eventType: 'Workshop',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        venue: 'Seminar Hall A',
        mode: 'In-Person',
        registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        speaker: 'John Smith',
        requiresMentorApproval: false,
        status: 'Upcoming'
      },
      {
        title: 'Coding Competition 2025',
        description: 'Annual coding competition with amazing prizes',
        eventType: 'Competition',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: 'Computer Lab',
        mode: 'In-Person',
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxParticipants: 200,
        speaker: 'Tech Team',
        requiresMentorApproval: true,
        status: 'Upcoming',
        rules: 'Teams of 3, 2 hours duration'
      },
      {
        title: 'Career Seminar - Industry Insights',
        description: 'Learn about career opportunities in tech industry',
        eventType: 'Seminar',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        venue: 'Auditorium',
        mode: 'Hybrid',
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        maxParticipants: 500,
        speaker: 'Industry Experts',
        requiresMentorApproval: false,
        status: 'Upcoming'
      },
      {
        title: 'Hackathon 2025',
        description: '24-hour hackathon to build innovative projects',
        eventType: 'Hackathon',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        venue: 'Innovation Center',
        mode: 'In-Person',
        registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        maxParticipants: 300,
        speaker: 'Hackathon Team',
        requiresMentorApproval: true,
        status: 'Upcoming',
        prizes: 'Prizes up to ₹50,000'
      },
      {
        title: 'Machine Learning Workshop',
        description: 'Introduction to ML and AI applications',
        eventType: 'Workshop',
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        venue: 'Lab 2',
        mode: 'Virtual',
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        maxParticipants: 150,
        speaker: 'ML Expert',
        requiresMentorApproval: false,
        status: 'Upcoming'
      }
    ]);
    console.log(`✅ Created ${events.length} events`);

    console.log('\n✨ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Mentor Assignments: ${mentorAssignments.length}`);
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Placements: ${placements.length}`);
    console.log(`   - Events: ${events.length}`);

    // Create Assignments
    const assignments = await Assignment.insertMany([
      {
        title: 'React Portfolio Project',
        course: 'Web Development',
        description: 'Build a personal portfolio website using React. Include sections for about, projects, skills, and contact.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high',
        points: 100,
        instructions: '1. Create a responsive layout\n2. Use React Router for navigation\n3. Deploy on Vercel or Netlify\n4. Submit the live URL and GitHub repo',
        createdBy: mentorUser1._id
      },
      {
        title: 'Data Structures Assignment',
        course: 'DSA',
        description: 'Implement common data structures: LinkedList, Stack, Queue, Binary Tree',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high',
        points: 80,
        instructions: '1. Write clean, commented code\n2. Include time complexity analysis\n3. Add unit tests for each structure',
        createdBy: mentorUser1._id
      },
      {
        title: 'Machine Learning Basics',
        course: 'AI/ML',
        description: 'Complete the ML basics module and submit a prediction model for house prices dataset',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium',
        points: 120,
        instructions: '1. Use Python with scikit-learn\n2. Perform EDA on the dataset\n3. Train at least 3 different models\n4. Compare accuracies',
        createdBy: mentorUser2._id
      },
      {
        title: 'Database Design Project',
        course: 'DBMS',
        description: 'Design and implement a database for an e-commerce platform',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        priority: 'medium',
        points: 90,
        instructions: '1. Create ER diagram\n2. Normalize to 3NF\n3. Write SQL queries for common operations\n4. Include stored procedures',
        createdBy: mentorUser1._id
      },
      {
        title: 'Resume Building Workshop',
        course: 'Career Development',
        description: 'Create a professional resume following the workshop guidelines',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'low',
        points: 50,
        instructions: '1. Use the provided template\n2. Include all relevant sections\n3. Get peer review\n4. Submit PDF format',
        createdBy: mentorUser2._id
      }
    ]);
    console.log(`   - Assignments: ${assignments.length}`);

    // Create Study Resources
    const resources = await StudyResource.insertMany([
      {
        title: 'React Complete Guide',
        subject: 'Web Development',
        resourceType: 'Video',
        description: 'Comprehensive React tutorial covering hooks, routing, state management',
        fileUrl: 'https://example.com/react-guide',
        uploadedBy: mentorUser1._id,
        isApproved: true,
        rating: 4.8,
        downloadCount: 150
      },
      {
        title: 'DSA Cheat Sheet',
        subject: 'Data Structures',
        resourceType: 'Notes',
        description: 'Quick reference for common data structures and algorithms with Big-O complexities',
        fileUrl: 'https://example.com/dsa-cheatsheet.pdf',
        uploadedBy: mentorUser1._id,
        isApproved: true,
        rating: 4.9,
        downloadCount: 320
      },
      {
        title: 'Python for Data Science',
        subject: 'Data Science',
        resourceType: 'Tutorial',
        description: 'Learn Python basics to advanced for data science applications',
        fileUrl: 'https://example.com/python-ds',
        uploadedBy: mentorUser2._id,
        isApproved: true,
        rating: 4.7,
        downloadCount: 200
      },
      {
        title: 'Interview Preparation Kit',
        subject: 'Career',
        resourceType: 'Notes',
        description: 'Collection of common interview questions with answers for tech roles',
        fileUrl: 'https://example.com/interview-kit.pdf',
        uploadedBy: mentorUser2._id,
        isApproved: true,
        rating: 4.6,
        downloadCount: 450
      },
      {
        title: 'System Design Basics',
        subject: 'System Design',
        resourceType: 'Video',
        description: 'Introduction to system design concepts for interviews',
        fileUrl: 'https://example.com/system-design',
        uploadedBy: mentorUser1._id,
        isApproved: true,
        rating: 4.5,
        downloadCount: 180
      }
    ]);
    console.log(`   - Study Resources: ${resources.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
