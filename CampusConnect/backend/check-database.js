// Quick script to check database data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Checking database...\n');

        // Count records in each table
        const userCount = await prisma.user.count();
        const studentCount = await prisma.student.count();
        const mentorCount = await prisma.mentor.count();
        const placementOfficerCount = await prisma.placementOfficer.count();
        const assignmentCount = await prisma.assignment.count();
        const eventCount = await prisma.event.count();
        const placementCount = await prisma.placement.count();
        const messageCount = await prisma.message.count();
        const announcementCount = await prisma.announcement.count();

        console.log('📊 Database Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Users:              ${userCount}`);
        console.log(`🎓 Students:           ${studentCount}`);
        console.log(`👨‍🏫 Mentors:            ${mentorCount}`);
        console.log(`🏢 Placement Officers: ${placementOfficerCount}`);
        console.log(`📝 Assignments:        ${assignmentCount}`);
        console.log(`📅 Events:             ${eventCount}`);
        console.log(`💼 Placements:         ${placementCount}`);
        console.log(`💬 Messages:           ${messageCount}`);
        console.log(`📢 Announcements:      ${announcementCount}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Show all users
        console.log('👥 All Users:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        if (users.length === 0) {
            console.log('⚠️  No users found in database!');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
            });
        }

        console.log('\n✅ Database check complete!\n');

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
