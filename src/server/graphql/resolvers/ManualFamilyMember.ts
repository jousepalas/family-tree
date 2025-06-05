// src/server/graphql/resolvers/ManualFamilyMember.ts
import { Context } from '../context';
import { ManualFamilyMember as PrismaManualFamilyMember } from '@prisma/client';

// Resolvers for fields on the ManualFamilyMember type
export const ManualFamilyMember = {
  // Resolve the 'addedBy' field (the User who created this entry)
  addedBy: async (parent: PrismaManualFamilyMember, _args: any, context: Context) => {
    return context.prisma.user.findUnique({
      where: { id: parent.addedById },
    });
    // Add error handling if user not found (shouldn't happen with constraints)
  },

  // Resolve the 'linkedUser' field (the User profile this entry is linked to)
  linkedUser: async (parent: PrismaManualFamilyMember, _args: any, context: Context) => {
    if (!parent.linkedUserId) {
      return null;
    }
    return context.prisma.user.findUnique({
      where: { id: parent.linkedUserId },
    });
  },
};