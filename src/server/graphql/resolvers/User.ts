// src/server/graphql/resolvers/User.ts
import { Context } from '../context';
import { User as PrismaUser } from '@prisma/client';

// Resolvers for fields on the User type, especially nested ones
export const User = {
  // Example: Resolve the 'invitedBy' field only when requested
  invitedBy: async (parent: PrismaUser, _args: any, context: Context) => {
    if (!parent.invitedById) {
      return null;
    }
    return context.prisma.user.findUnique({
      where: { id: parent.invitedById },
    });
  },

  // Example: Resolve 'relationshipsInitiated' (could add pagination/filtering)
  // relationshipsInitiated: async (parent: PrismaUser, args: { limit?: number, offset?: number }, context: Context) => {
  //   return context.prisma.relationship.findMany({
  //     where: { initiatorId: parent.id },
  //     take: args.limit || undefined,
  //     skip: args.offset || undefined,
  //     include: { target: true }, // Include target user data
  //   });
  // },

  // Example: Resolve 'relationshipsReceived'
  // relationshipsReceived: async (parent: PrismaUser, args: { limit?: number, offset?: number }, context: Context) => {
  //    return context.prisma.relationship.findMany({
  //      where: { targetId: parent.id },
  //      take: args.limit || undefined,
  //      skip: args.offset || undefined,
  //      include: { initiator: true }, // Include initiator user data
  //    });
  // },

  // Example: Resolve 'manualMembersAdded'
  // manualMembersAdded: async (parent: PrismaUser, args: { limit?: number, offset?: number }, context: Context) => {
  //    return context.prisma.manualFamilyMember.findMany({
  //      where: { addedById: parent.id },
  //      take: args.limit || undefined,
  //      skip: args.offset || undefined,
  //    });
  // },

  // Add resolvers for other fields like 'posts', 'comments' if needed
};