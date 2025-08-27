
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Seeding disabled. Using persistent database. ---');
    // Seeding is now handled manually or through migrations to preserve data.
    // You can add one-time seeding logic here if needed, for example:
    // const productCount = await prisma.product.count();
    // if (productCount === 0) {
    //   console.log("No products found, seeding initial data...");
    //   // Add your initial data seeding here
    // }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
