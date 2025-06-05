// src/server/graphql/resolvers/Relationship.ts
import { Context } from '../context';
import { Relationship as PrismaRelationship } from '@prisma/client';

// Resolvers for fields on the Relationship type
export const Relationship = {
  // Resolve the 'initiator' User
  initiator: async (parent: PrismaRelationship, _args: any, context: Context) => {
    return context.prisma.user.findUnique({
      where: { id: parent.initiatorId },
    });
    // Add error handling
  },

  // Resolve the 'target' User
  target: async (parent: PrismaRelationship, _args: any, context: Context) => {
    return context.prisma.user.findUnique({
      where: { id: parent.targetId },
    });
    // Add error handling
  },
};