import { PrismaClient } from '@prisma/client';

// Declara um 'global' para armazenar o client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se o client não existir, cria um novo
// Se existir (ex: em hot-reload de desenvolvimento), reutiliza o existente
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;