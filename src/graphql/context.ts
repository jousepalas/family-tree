import { PrismaClient } from '@prisma/client';

// Define a interface para o contexto que será passado aos resolvers
export interface Context {
  prisma: PrismaClient;
  user?: { id: string; email: string; } | null; // Usuário autenticado (ou null)
}