// Script to restore users from backup
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreUsers() {
    try {
        console.log('🔄 Restoring users from backup...\n');

        // Read the backup file
        const backupData = JSON.parse(
            fs.readFileSync('/Users/pravin/Downloads/users_export_2026-01-18T05_15_36.812Z.json', 'utf8')
        );

        console.log(`📦 Found ${backupData.length} users in backup\n`);

        // Default password for all users
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        let restored = 0;
        let skipped = 0;

        for (const userData of backupData) {
            try {
                // Check if user already exists
                const existing = await prisma.user.findUnique({
                    where: { email: userData.email }
                });

                if (existing) {
                    console.log(`⏭️  Skipping ${userData.email} (already exists)`);
                    skipped++;
                    continue;
                }

                // Create user
                const user = await prisma.user.create({
                    data: {
                        email: userData.email,
                        passwordHash: hashedPassword,
                        role: userData.role,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phone: userData.phone,
                        isFirstLogin: true,
                    }
                });

                console.log(`✅ Restored: ${userData.firstName} ${userData.lastName} (${userData.email})`);

                // Create related records
                if (userData.student && userData.role === 'STUDENT') {
                    await prisma.student.create({
                        data: {
                            userId: user.id,
                            rollNumber: userData.student.rollNumber,
                            year: userData.student.year,
                            department: userData.student.department,
                        }
                    });
                    console.log(`   📚 Created student profile`);
                }

                if (userData.mentor && userData.role === 'MENTOR') {
                    await prisma.mentor.create({
                        data: {
                            userId: user.id,
                            department: userData.mentor.department,
                            specialization: userData.mentor.specialization,
                            experienceYears: userData.mentor.experienceYears,
                        }
                    });
                    console.log(`   👨‍🏫 Created mentor profile`);
                }

                if (userData.placementOfficer && userData.role === 'PLACEMENT_OFFICER') {
                    await prisma.placementOfficer.create({
                        data: {
                            userId: user.id,
                            department: userData.placementOfficer.department,
                            designation: userData.placementOfficer.designation,
                        }
                    });
                    console.log(`   🏢 Created placement officer profile`);
                }

                restored++;

            } catch (error) {
                console.error(`❌ Error restoring ${userData.email}:`, error.message);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Restored: ${restored} users`);
        console.log(`⏭️  Skipped: ${skipped} users (already exist)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🔐 Default password for all restored users: password123');
        console.log('⚠️  Users should change their password after first login\n');

    } catch (error) {
        console.error('❌ Error restoring users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreUsers();
