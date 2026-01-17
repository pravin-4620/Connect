import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database reset...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    // Delete in order of dependencies (child first)
    await prisma.analyticsLog.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.skillsTest.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.studyMaterial.deleteMany();
    await prisma.gatePass.deleteMany();
    await prisma.eventRegistration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.placementApplication.deleteMany();
    await prisma.placement.deleteMany();
    await prisma.email.deleteMany();
    await prisma.message.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.student.deleteMany();
    await prisma.mentor.deleteMany();
    await prisma.placementOfficer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSettings.deleteMany();

    // Hash password for admin
    const password = await bcrypt.hash('password123', 10);

    // Create Admin
    console.log('👤 Creating admin user...');
    await prisma.user.create({
        data: {
            email: 'admin@campusconnect.edu',
            passwordHash: password,
            role: 'ADMIN',
            firstName: 'System',
            lastName: 'Administrator',
            phone: '+1234567890',
            isFirstLogin: false
        }
    });

    // Create default System Settings
    console.log('⚙️  Creating default settings...');
    await prisma.systemSettings.createMany({
        data: [
            { key: 'academicYear', value: '2023-2024' },
            { key: 'semester', value: 'ODD' },
            { key: 'maintenanceMode', value: 'false' },
            { key: 'departments', jsonValue: JSON.stringify(['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE']) }
        ]
    });

    console.log('✅ Database reset and initialized successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Email: admin@campusconnect.edu');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
