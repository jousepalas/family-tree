// src/server/graphql/resolvers/Query.ts
import { Context } from '../context';
import { GraphQLError } from 'graphql';
import { Prisma, RelationshipType, User as PrismaUser, ManualFamilyMember as PrismaManualMember, Relationship as PrismaRelationship } from '@prisma/client';
import { FamilyTreeNode } from './types'; // Import the shared type definition

// Helper function to check authentication
function requireAuth(currentUser: Context['currentUser']): asserts currentUser is NonNullable<Context['currentUser']> {
  if (!currentUser) {
    throw new GraphQLError('User is not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

// Helper to build the tree structure (Complex - requires careful implementation)
async function buildFamilyTree(startUserId: string, prisma: Context['prisma']): Promise<{ nodes: FamilyTreeNode[] }> {
    const nodes: FamilyTreeNode[] = [];
    const nodeMap = new Map<string, FamilyTreeNode>(); // Map nodeId to node object
    const processedIds = new Set<string>(); // Keep track of processed User/Manual IDs

    const queue: string[] = [startUserId]; // Start BFS/DFS from the initial user

    while (queue.length > 0) {
        const currentUserId = queue.shift();
        if (!currentUserId || processedIds.has(`user-${currentUserId}`)) continue;

        const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            include: {
                relationshipsInitiated: { include: { target: true } }, // User -> Target
                relationshipsReceived: { include: { initiator: true } }, // Initiator -> User
                manualMembersAdded: true, // Manual members added BY this user
            }
        });

        if (!user) continue;
        processedIds.add(`user-${user.id}`);

        // --- 1. Add User Node ---
        const userNodeId = `user-${user.id}`;
        let userNode = nodeMap.get(userNodeId);
        if (!userNode) {
            userNode = {
                id: user.id,
                nodeId: userNodeId,
                type: 'USER',
                name: user.name || 'Unknown User',
                gender: user.gender || undefined,
                dateOfBirth: user.dateOfBirth || undefined,
                imageUrl: user.image || undefined,
                parents: [],
                spouses: [],
                children: [],
            };
            nodes.push(userNode);
            nodeMap.set(userNodeId, userNode);
        }

        // --- 2. Process Relationships (Users) ---
        const relationships = [...user.relationshipsInitiated, ...user.relationshipsReceived];
        for (const rel of relationships) {
            let relatedUserId: string | null = null;
            let relatedUser: PrismaUser | null = null;
            let relationshipDirection: 'toTarget' | 'fromInitiator' | null = null;

            if (rel.initiatorId === user.id) { // user -> target
                relatedUserId = rel.targetId;
                relatedUser = rel.target;
                relationshipDirection = 'toTarget';
            } else if (rel.targetId === user.id) { // initiator -> user
                relatedUserId = rel.initiatorId;
                relatedUser = rel.initiator;
                relationshipDirection = 'fromInitiator';
            }

            if (!relatedUserId || !relatedUser) continue;

            const relatedNodeId = `user-${relatedUserId}`;
            let relatedNode = nodeMap.get(relatedNodeId);
            if (!relatedNode) {
                 relatedNode = {
                    id: relatedUser.id,
                    nodeId: relatedNodeId,
                    type: 'USER',
                    name: relatedUser.name || 'Unknown User',
                    gender: relatedUser.gender || undefined,
                    dateOfBirth: relatedUser.dateOfBirth || undefined,
                    imageUrl: relatedUser.image || undefined,
                    parents: [],
                    spouses: [],
                    children: [],
                };
                nodes.push(relatedNode);
                nodeMap.set(relatedNodeId, relatedNode);
                if (!processedIds.has(`user-${relatedUserId}`)) {
                    queue.push(relatedUserId); // Add related user to queue for processing
                }
            }

            // Add links based on relationship type
            switch (rel.type) {
                case RelationshipType.PARENT:
                    if (relationshipDirection === 'toTarget') { // User is PARENT of target
                        userNode.children.push(relatedNodeId);
                        relatedNode.parents.push(userNodeId);
                    } else { // Initiator is PARENT of user
                        userNode.parents.push(relatedNodeId);
                        relatedNode.children.push(userNodeId);
                    }
                    break;
                case RelationshipType.CHILD:
                     if (relationshipDirection === 'toTarget') { // User is CHILD of target
                        userNode.parents.push(relatedNodeId);
                        relatedNode.children.push(userNodeId);
                    } else { // Initiator is CHILD of user
                        userNode.children.push(relatedNodeId);
                        relatedNode.parents.push(userNodeId);
                    }
                    break;
                case RelationshipType.SPOUSE:
                    // Add spouse link symmetrically
                    if (!userNode.spouses.includes(relatedNodeId)) userNode.spouses.push(relatedNodeId);
                    if (!relatedNode.spouses.includes(userNodeId)) relatedNode.spouses.push(userNodeId);
                    break;
                // Add cases for SIBLING etc. if needed (often derived via common parents)
            }
        }

         // --- 3. Process Manual Members Added BY this User ---
        for (const manualMember of user.manualMembersAdded) {
            if (processedIds.has(`manual-${manualMember.id}`)) continue;
            processedIds.add(`manual-${manualMember.id}`);

            const manualNodeId = `manual-${manualMember.id}`;
            const manualNode: FamilyTreeNode = {
                id: manualMember.id,
                nodeId: manualNodeId,
                type: 'MANUAL',
                name: manualMember.name,
                gender: manualMember.gender || undefined,
                dateOfBirth: manualMember.dateOfBirth || undefined,
                imageUrl: undefined, // Placeholder image for manual members?
                parents: [],
                spouses: [],
                children: [],
            };
            nodes.push(manualNode);
            nodeMap.set(manualNodeId, manualNode);

            // Link manual member based on relationshipToAdder
            switch (manualMember.relationshipToAdder) {
                 case RelationshipType.PARENT: // Manual member is PARENT of user
                    userNode.parents.push(manualNodeId);
                    // manualNode.children.push(userNodeId); // Can add if needed
                    break;
                 case RelationshipType.CHILD: // Manual member is CHILD of user
                    userNode.children.push(manualNodeId);
                    // manualNode.parents.push(userNodeId); // Can add if needed
                    break;
                 case RelationshipType.SPOUSE: // Manual member is SPOUSE of user
                    if (!userNode.spouses.includes(manualNodeId)) userNode.spouses.push(manualNodeId);
                    // manualNode.spouses.push(userNodeId); // Can add if needed
                    break;
                 case RelationshipType.SIBLING: // Manual member is SIBLING of user
                    // Siblings usually linked via common parents, handle implicitly or add direct link if desired
                    break;
            }
        }
    }

    // Post-processing: Ensure links are consistent (e.g., if A is parent of B, B should have A as parent)
    // This might be redundant if logic above is correct, but good for safety.
    nodes.forEach(node => {
        node.parents = [...new Set(node.parents)];
        node.spouses = [...new Set(node.spouses)];
        node.children = [...new Set(node.children)];
    });


    console.log(`Built tree with ${nodes.length} nodes starting from ${startUserId}`);
    return { nodes };
}


export const Query = {
  me: async (_parent: any, _args: any, context: Context): Promise<PrismaUser | null> => {
    requireAuth(context.currentUser);
    // Fetch fresh user data including necessary relations if needed immediately
    const user = await context.prisma.user.findUnique({
        where: { id: context.currentUser.id }
        // include: { /* relations */ }
    });
     if (!user) {
         // This shouldn't happen if currentUser is set, but good practice
         throw new GraphQLError('User not found', {
             extensions: { code: 'NOT_FOUND' },
         });
     }
    return user;
  },

  getUserProfile: async (_parent: any, args: { userId: string }, context: Context): Promise<PrismaUser | null> => {
     console.log("Fetching profile for user:", args.userId);
     const requestedUser = await context.prisma.user.findUnique({ where: { id: args.userId }});

     if (!requestedUser) {
         throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' }});
     }

     // --- Privacy Check ---
     // Allow access if:
     // 1. It's the user themselves
     // 2. The profile is public
     // 3. They are related (TODO: Implement relationship check logic)
     const isOwner = context.currentUser?.id === args.userId;
     const isPublic = requestedUser.isProfilePublic;
     // const areRelated = await checkRelationship(context.currentUser?.id, args.userId, context.prisma); // Implement this helper

     if (isOwner || isPublic /* || areRelated */) {
         return requestedUser;
     } else {
         // Return limited data or throw error
         // Option 1: Throw Forbidden
          throw new GraphQLError('Access Denied: Profile is private', { extensions: { code: 'FORBIDDEN' }});
         // Option 2: Return limited data (e.g., only name and image if related)
         // return { id: requestedUser.id, name: requestedUser.name, image: requestedUser.image, /* other fields null */ };
     }
  },

  getFamilyTreeData: async (_parent: any, args: { userId: string }, context: Context): Promise<{ nodes: FamilyTreeNode[] }> => {
      // TODO: Add authorization check - can the currentUser view the tree of userId?
      // (e.g., are they the same user, or are they related?)
      requireAuth(context.currentUser); // At least require login for now
      console.log(`Fetching family tree data for user: ${args.userId} by user: ${context.currentUser.id}`);

      try {
          const treeData = await buildFamilyTree(args.userId, context.prisma);
          return treeData;
      } catch (error) {
          console.error("Error building family tree:", error);
          throw new GraphQLError('Failed to build family tree', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
  },

  searchUsers: async (_parent: any, args: { term: string }, context: Context) => {
      requireAuth(context.currentUser); // Require login to search
      const searchTerm = args.term.trim();
      console.log(`Searching users with term: "${searchTerm}" by user: ${context.currentUser.id}`);

      if (!searchTerm || searchTerm.length < 2) {
          // Return empty or throw error for short terms
          return [];
      }

      // TODO: Refine search logic
      // - Search public profiles?
      // - Search within the user's known family (related users/manual members)?
      // - Combine results?
      // - Add pagination

      // Example: Search public user profiles by name or email
      const users = await context.prisma.user.findMany({
          where: {
              isProfilePublic: true, // Only search public profiles for now
              id: { not: context.currentUser.id }, // Exclude self
              OR: [
                  { name: { contains: searchTerm, mode: 'insensitive' } },
                  { email: { contains: searchTerm, mode: 'insensitive' } }, // Careful with email search privacy
              ],
          },
          select: { // Select only necessary fields for search result
              id: true,
              name: true,
              email: true, // Only return if appropriate
              image: true,
          },
          take: 10, // Limit results
      });

      // Map to SearchResult type
      return users.map(user => ({
          id: user.id,
          name: user.name || 'Unnamed User',
          email: user.email, // Consider masking or omitting based on privacy rules
          image: user.image,
          type: 'USER',
      }));
      // Potentially add search for ManualFamilyMembers created by the user here as well
  },

  getMyManualMembers: async (_parent: any, _args: any, context: Context): Promise<PrismaManualMember[]> => {
      requireAuth(context.currentUser);
      return context.prisma.manualFamilyMember.findMany({
          where: { addedById: context.currentUser.id },
          orderBy: { createdAt: 'desc' },
          // include: { addedBy: true } // Optional: include user who added them
      });
  },

   getMyRelationships: async (_parent: any, _args: any, context: Context): Promise<PrismaRelationship[]> => {
       requireAuth(context.currentUser);
       return context.prisma.relationship.findMany({
           where: {
               OR: [
                   { initiatorId: context.currentUser.id },
                   { targetId: context.currentUser.id },
               ]
           },
           include: { // Include related users for display
               initiator: true,
               target: true,
           },
           orderBy: { createdAt: 'desc' },
       });
   },

    // --- Placeholder Resolvers for Content ---
    // getPosts: async (...) => { /* ... */ },
    // getUpcomingEvents: async (...) => { /* ... */ },
    // getRecentBirthdays: async (...) => { /* ... */ },
};

// --- Helper Type for Tree Node ---
// (Can be moved to a separate types file)
declare module './types' {
    interface FamilyTreeNode {
        id: string;           // User ID or ManualFamilyMember ID
        nodeId: string;       // Unique ID for the library (e.g., "user-123")
        type: 'USER' | 'MANUAL';
        name: string;
        gender?: Gender | null;
        dateOfBirth?: Date | null;
        imageUrl?: string | null;
        parents: string[];    // List of parent node IDs
        spouses: string[];    // List of spouse node IDs
        children: string[];   // List of child node IDs
    }
}