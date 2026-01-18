// Script to update user password
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
    try {
        const email = 'prem@campusconnect.edu';
        const newPassword = 'Password@123';

        console.log(`🔐 Updating password for ${email}...\n`);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user
        const user = await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });

        console.log(`✅ Password updated successfully!`);
        console.log(`   Email: ${user.email}`);
        console.log(`   New Password: ${newPassword}\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updatePassword();
