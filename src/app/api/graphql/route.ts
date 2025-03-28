import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { resolvers } from '../../../graphql/resolvers';
import { typeDefs } from '../../../graphql/typeDefs';
import prisma from '../../../lib/prisma';
import { getUserFromToken } from '../../../lib/auth'; // Função para decodificar token e buscar usuário

// Define a interface do Contexto
export interface Context {
  prisma: typeof prisma;
  user?: { id: string; email: string; } | null; // Usuário decodificado do token
}

const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
  introspection: process.env.NODE_ENV !== 'production', // Habilita em dev/staging
});

// Cria o handler para Next.js
const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  // Função para construir o contexto para cada request
  context: async (req) => {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const user = await getUserFromToken(token); // Busca o usuário baseado no token
    return { prisma, user }; // Disponibiliza prisma e user no contexto dos resolvers
  },
});

// Exporta os handlers para GET e POST (necessário para App Router)
export { handler as GET, handler as POST };