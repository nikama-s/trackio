import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
});

async function main() {
  try {
    console.log("Testing MongoDB Atlas connection...");

    // Test connection
    const ping = await prisma.$runCommandRaw({ ping: 1 });
    console.log("✅ Ping successful:", ping);

    // Test basic query
    const users = await prisma.user.findMany({ take: 1 });
    console.log(`Found ${users.length} user(s)`);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
