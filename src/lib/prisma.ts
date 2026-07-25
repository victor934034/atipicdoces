import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Falls back to a placeholder so the client can be instantiated during
// `next build` (which imports this module but never opens a connection),
// even when DATABASE_URL isn't set as a build-time env var.
const adapter = new PrismaMariaDb(
  process.env.DATABASE_URL ?? "mysql://user:password@localhost:3306/db"
);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
