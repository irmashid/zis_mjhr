const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Try to connect and run a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', result);

    // Try to count transactions
    const count = await prisma.transaction.count();
    console.log('Current transaction count:', count);

    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
