import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAll() {
    try {
        // Get ALL settings
        const allSettings = await prisma.systemSettings.findMany();
        
        console.log('\n=== SEARCHING FOR MAINTENANCE SETTINGS ===');
        const maintenanceSettings = allSettings.filter(s => 
            s.key.toLowerCase().includes('maintenance')
        );
        
        console.log(`Found ${maintenanceSettings.length} maintenance-related settings:`);
        maintenanceSettings.forEach(s => {
            console.log('\n---');
            console.log(JSON.stringify(s, null, 2));
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAll();
