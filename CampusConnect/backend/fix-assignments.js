// Script to fix mentor-student assignments
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAssignments() {
    try {
        console.log('🔧 Fixing mentor-student assignments...\n');

        // Get all students
        const students = await prisma.student.findMany({
            include: {
                user: true
            }
        });

        // Get all mentors
        const mentors = await prisma.mentor.findMany({
            include: {
                user: true
            }
        });

        // Get placement officer
        const placementOfficer = await prisma.placementOfficer.findFirst({
            include: {
                user: true
            }
        });

        console.log(`Found ${students.length} students`);
        console.log(`Found ${mentors.length} mentors`);
        console.log(`Found ${placementOfficer ? 1 : 0} placement officers\n`);

        if (mentors.length === 0) {
            console.log('⚠️  No mentors found. Cannot assign students.');
            return;
        }

        // Assign students to mentors (round-robin)
        let mentorIndex = 0;
        for (const student of students) {
            const mentor = mentors[mentorIndex];

            await prisma.student.update({
                where: { id: student.id },
                data: {
                    mentorId: mentor.id,
                    placementOfficerId: placementOfficer?.id || null
                }
            });

            console.log(`✅ Assigned ${student.user.firstName} ${student.user.lastName} to mentor ${mentor.user.firstName} ${mentor.user.lastName}`);

            // Move to next mentor (round-robin)
            mentorIndex = (mentorIndex + 1) % mentors.length;
        }

        console.log('\n✅ All assignments fixed!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixAssignments();
