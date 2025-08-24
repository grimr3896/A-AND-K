
import { PrismaClient } from '@prisma/client'
import path from 'path';
import os from 'os';
import fs from 'fs';


const prismaClientSingleton = () => {
  let dbPath;

  // In a packaged Electron app, process.env.NODE_ENV is often 'production'.
  // We'll use a more reliable check for a packaged app environment.
  // A common practice for Electron apps is to check for `app.isPackaged`.
  // Since we are in a Node.js backend context, we can simulate this by checking NODE_ENV.
  if (process.env.NODE_ENV === 'production') {
    // This is where the database will live in a packaged desktop app.
    // It ensures each user has their own database in their local app data folder.
    const userDataPath = os.homedir(); // Simplified for cross-platform compatibility. A real app might use a library for this.
    const appDataPath = path.join(userDataPath, '.ak-babyshop');

    // Ensure the directory exists
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    dbPath = path.join(appDataPath, 'prod.db');
    
    // Copy the initial database if it doesn't exist
    // This is useful if you ship a pre-seeded database with your app.
    const seedDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath) && fs.existsSync(seedDbPath)) {
        fs.copyFileSync(seedDbPath, dbPath);
    }

  } else {
    // For development, we use a local file in the prisma directory.
    dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  }

  const databaseUrl = `file:${dbPath}`;
  
  return new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        }
    }
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
