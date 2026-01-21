import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMaintenance() {
    try {
        const settings = await prisma.systemSettings.findMany();
        console.log('\n=== ALL SYSTEM SETTINGS ===');
        settings.forEach(s => {
            console.log(`Key: ${s.key}`);
            console.log(`Value: ${s.value}`);
            console.log(`JSON Value: ${JSON.stringify(s.jsonValue)}`);
            console.log('---');
        });
        
        const maintenanceSetting = settings.find(s => 
            s.key === 'maintenance_mode' || s.key === 'maintenanceMode'
        );
        
        console.log('\n=== MAINTENANCE MODE SETTING ===');
        console.log(JSON.stringify(maintenanceSetting, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkMaintenance();
