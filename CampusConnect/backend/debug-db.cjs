const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const settings = await prisma.systemSettings.findMany();
        console.log('---BEGIN---');
        console.log(JSON.stringify(settings, null, 2));
        console.log('---END---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
