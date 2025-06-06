// src/server/graphql/resolvers/Mutation.ts
import bcrypt from 'bcrypt';
import { Context } from '../context';
import { GraphQLError } from 'graphql';
import { Prisma, RelationshipType, Gender } from '@prisma/client'; // Import Prisma types and enums
import crypto from 'crypto'; // For generating invite codes

// Helper function to check authentication
function requireAuth(currentUser: Context['currentUser']): asserts currentUser is NonNullable<Context['currentUser']> {
  if (!currentUser) {
    throw new GraphQLError('User is not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

// --- Input Type Interfaces (matching GraphQL schema) ---

interface RegisterUserInput {
  input: {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: Date | string; // Allow string for flexibility from client
    gender?: Gender;
    fatherName?: string;
    motherName?: string;
    phoneNumber?: string;
    countryCode?: string;
    country?: string;
    inviteCode?: string;
  }
}

 interface UpdateUserProfileInput {
   input: {
     name?: string;
     dateOfBirth?: Date | string;
     gender?: Gender;
     fatherName?: string;
     motherName?: string;
     phoneNumber?: string;
     countryCode?: string;
     country?: string;
     isProfilePublic?: boolean;
     image?: string; // URL
   }
 }

 interface AddManualMemberInput {
    input: {
        name: string;
        gender?: Gender;
        dateOfBirth?: Date | string;
        relationshipToAdder: RelationshipType; // e.g., 'PARENT'
    }
 }

 interface CreateRelationshipInput {
     input: {
         targetId: string;
         type: RelationshipType;
     }
 }

// --- Mutation Resolvers ---

export const Mutation = {
  registerUser: async (_parent: any, { input }: RegisterUserInput, context: Context) => {
    const { name, email, password, inviteCode, ...profileData } = input;

    // --- Basic Validation ---
    if (!email || !password || !name) {
      throw new GraphQLError('Missing required fields (name, email, password)', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: !name ? 'name' : !email ? 'email' : 'password' },
      });
    }
    if (password.length < 8) {
       throw new GraphQLError('Password must be at least 8 characters long', {
           extensions: { code: 'BAD_USER_INPUT', argumentName: 'password' },
       });
    }
    // Validate email format (basic)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new GraphQLError('Invalid email format', {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'email' },
        });
    }

    // --- Check if user already exists ---
    const existingUser = await context.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new GraphQLError('An account with this email already exists.', {
        extensions: { code: 'BAD_USER_INPUT', argumentName: 'email' },
      });
    }

    // --- Hash password ---
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // --- Handle Invite Code ---
    let invitedById: string | null = null;
    if (inviteCode) {
        const inviter = await context.prisma.user.findUnique({
            where: { inviteCode },
        });
        if (inviter) {
            invitedById = inviter.id;
            console.log(`User ${email} invited by ${inviter.email} (ID: ${inviter.id})`);
        } else {
            console.warn(`Invite code "${inviteCode}" provided during registration but not found.`);
            // Optional: Throw error if invite code MUST be valid
            // throw new GraphQLError('Invalid invite code provided.', { extensions: { code: 'BAD_USER_INPUT', argumentName: 'inviteCode' } });
        }
    }

    // --- Prepare Profile Data ---
    const dob = profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined;
    if (dob && isNaN(dob.getTime())) {
         throw new GraphQLError('Invalid date of birth format.', {
             extensions: { code: 'BAD_USER_INPUT', argumentName: 'dateOfBirth' },
         });
    }

    try {
      const newUser = await context.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(), // Store email consistently
          passwordHash,
          invitedById: invitedById,
          dateOfBirth: dob,
          gender: profileData.gender,
          fatherName: profileData.fatherName,
          motherName: profileData.motherName,
          phoneNumber: profileData.phoneNumber,
          countryCode: profileData.countryCode,
          country: profileData.country,
          isProfilePublic: false, // Default to private
          // Generate an invite code for the new user
          inviteCode: crypto.randomBytes(8).toString('hex'),
          emailVerified: null, // Set emailVerified upon verification step if implemented
        },
      });
      console.log('User registered successfully:', newUser.email);

      // --- Potential Post-Registration Actions ---
      // 1. Send Welcome Email (requires email service setup)
      // 2. Auto-link based on invite code (create relationships)
      if (invitedById) {
          // TODO: Decide relationship type based on invite context? Or require manual linking?
          // For now, just log the connection.
          console.log(`TODO: Potentially create relationship between ${newUser.id} and inviter ${invitedById}`);
      }
      // 3. Trigger search for matching ManualFamilyMembers (complex feature)
      //    await findAndSuggestManualMemberMatches(newUser, context.prisma);

      return newUser;
    } catch (error) {
       console.error("Registration Error:", error);
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // This check might be redundant due to the check above, but good practice
            throw new GraphQLError('An account with this email already exists.', {
                extensions: { code: 'BAD_USER_INPUT', argumentName: 'email' },
            });
       }
      throw new GraphQLError('Could not register user due to a server error.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  updateProfile: async (_parent: any, { input }: UpdateUserProfileInput, context: Context) => {
     requireAuth(context.currentUser);
     const userId = context.currentUser.id;

     // --- Prepare Data ---
     const dataToUpdate: Prisma.UserUpdateInput = {};
     if (input.name !== undefined) dataToUpdate.name = input.name;
     if (input.dateOfBirth !== undefined) {
         const dob = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
          if (dob && isNaN(dob.getTime())) {
             throw new GraphQLError('Invalid date of birth format.', { extensions: { code: 'BAD_USER_INPUT', argumentName: 'dateOfBirth' } });
          }
         dataToUpdate.dateOfBirth = dob;
     }
     if (input.gender !== undefined) dataToUpdate.gender = input.gender;
     if (input.fatherName !== undefined) dataToUpdate.fatherName = input.fatherName;
     if (input.motherName !== undefined) dataToUpdate.motherName = input.motherName;
     if (input.phoneNumber !== undefined) dataToUpdate.phoneNumber = input.phoneNumber;
     if (input.countryCode !== undefined) dataToUpdate.countryCode = input.countryCode;
     if (input.country !== undefined) dataToUpdate.country = input.country;
     if (input.image !== undefined) dataToUpdate.image = input.image; // Assuming URL is passed
     if (typeof input.isProfilePublic === 'boolean') dataToUpdate.isProfilePublic = input.isProfilePublic;

     if (Object.keys(dataToUpdate).length === 0) {
         throw new GraphQLError('No update data provided.', { extensions: { code: 'BAD_USER_INPUT' } });
     }

     try {
         const updatedUser = await context.prisma.user.update({
             where: { id: userId },
             data: dataToUpdate,
         });
         console.log(`Profile updated for user: ${userId}`);
         return updatedUser;
     } catch (error) {
          console.error("Update Profile Error:", error);
           throw new GraphQLError('Could not update profile.', {
             extensions: { code: 'INTERNAL_SERVER_ERROR' },
           });
     }
  },

   generateInviteCode: async (_parent: any, _args: any, context: Context) => {
       requireAuth(context.currentUser);
       const userId = context.currentUser.id;

       let user = await context.prisma.user.findUnique({ where: { id: userId }});
       if (!user) throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' }});

       // Generate invite code if user doesn't have one yet or if forced regeneration
       if (!user.inviteCode) {
           const inviteCode = crypto.randomBytes(8).toString('hex');
           try {
               user = await context.prisma.user.update({
                   where: { id: userId },
                   data: { inviteCode },
               });
               console.log(`Generated new invite code for user ${userId}`);
           } catch (error) {
                console.error(`Error generating invite code for user ${userId}:`, error);
                throw new GraphQLError('Could not generate invite code.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
           }
       }
       // Return the code itself
       return user.inviteCode!;
       // Or construct a full URL:
       // const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
       // return `${baseUrl}/register?invite=${user.inviteCode}`;
   },

   addManualMember: async (_parent: any, { input }: AddManualMemberInput, context: Context) => {
        requireAuth(context.currentUser);
        const userId = context.currentUser.id;

        const { name, relationshipToAdder, ...profileData } = input;

        if (!name || !relationshipToAdder) {
             throw new GraphQLError('Missing required fields (name, relationshipToAdder)', {
                 extensions: { code: 'BAD_USER_INPUT', argumentName: !name ? 'name' : 'relationshipToAdder' },
             });
        }

        const dob = profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined;
        if (dob && isNaN(dob.getTime())) {
            throw new GraphQLError('Invalid date of birth format.', { extensions: { code: 'BAD_USER_INPUT', argumentName: 'dateOfBirth' } });
        }

       try {
           const newMember = await context.prisma.manualFamilyMember.create({
               data: {
                   addedById: userId,
                   name: name,
                   gender: profileData.gender,
                   dateOfBirth: dob,
                   relationshipToAdder: relationshipToAdder,
               }
           });
           console.log(`Manual member "${name}" added by user ${userId}`);

           // TODO: Consider creating implicit relationships if possible/desired.
           // e.g., If relationshipToAdder is PARENT, does this imply the new member
           // has a CHILD relationship *to* the current user? This gets complex quickly.
           // For now, rely on explicit relationship creation via `createRelationship`.

           return newMember;
       } catch (error) {
           console.error("Add Manual Member Error:", error);
           throw new GraphQLError('Could not add manual family member.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
   },

   linkManualMemberToUser: async (_parent: any, args: { manualMemberId: string, userId: string }, context: Context) => {
       requireAuth(context.currentUser);
       const currentUserId = context.currentUser.id;
       const { manualMemberId, userId: targetUserId } = args;

       console.log(`Attempting to link ManualMember ${manualMemberId} to User ${targetUserId} by User ${currentUserId}`);

       // --- Authorization Checks ---
       // 1. Does the Manual Member exist?
       // 2. Was it added by the current user OR is the target user the current user? (Permission check)
       // 3. Is the Manual Member already linked?
       // 4. Does the Target User exist?

       const manualMember = await context.prisma.manualFamilyMember.findUnique({
           where: { id: manualMemberId }
       });
       if (!manualMember) throw new GraphQLError('Manual family member not found.', { extensions: { code: 'NOT_FOUND' } });

       // Permission: Allow linking if current user added the manual entry OR if the target is the current user accepting a link suggestion
       if (manualMember.addedById !== currentUserId && targetUserId !== currentUserId) {
            throw new GraphQLError('You do not have permission to link this member.', { extensions: { code: 'FORBIDDEN' } });
       }

       if (manualMember.linkedUserId) {
           if (manualMember.linkedUserId === targetUserId) return true; // Already linked to the correct user
           throw new GraphQLError('Manual member is already linked to a different user.', { extensions: { code: 'BAD_REQUEST' } });
       }

       const targetUser = await context.prisma.user.findUnique({
           where: { id: targetUserId }
       });
       if (!targetUser) throw new GraphQLError('Target user not found.', { extensions: { code: 'NOT_FOUND' } });


       try {
           // --- Perform the Link ---
           await context.prisma.manualFamilyMember.update({
               where: { id: manualMemberId },
               data: {
                   linkedUserId: targetUserId
               }
           });
           console.log(`Successfully linked ManualMember ${manualMemberId} to User ${targetUserId}`);

           // --- Create Corresponding Relationships (Crucial Step) ---
           // This logic creates the actual connections in the registered user graph.
           const adderId = manualMember.addedById; // User who created the manual entry
           const relationshipFromManualToAdder = manualMember.relationshipToAdder; // e.g., PARENT

           // We need to create relationships between the Adder (adderId) and the Target (targetUserId)
           // based on the relationship defined when the manual member was added.

           if (relationshipFromManualToAdder) {
               // Determine the relationship between Adder and Target based on Manual->Adder relationship
               // Example: If Maria (Adder) added 'Pedro (Manual)' as SIBLING, and Pedro (Target) confirms,
               // then Maria and Pedro are SIBLINGS.

               // Determine reciprocal relationship type
               let reciprocalType: RelationshipType | null = null;
               switch (relationshipFromManualToAdder) {
                   case RelationshipType.PARENT: reciprocalType = RelationshipType.CHILD; break;
                   case RelationshipType.CHILD: reciprocalType = RelationshipType.PARENT; break;
                   case RelationshipType.SPOUSE: reciprocalType = RelationshipType.SPOUSE; break;
                   case RelationshipType.SIBLING: reciprocalType = RelationshipType.SIBLING; break;
                   // Add other cases as needed
               }

               if (reciprocalType) {
                   // Create relationship: Adder -> Target
                   await context.prisma.relationship.upsert({
                       where: { initiatorId_targetId_type: { initiatorId: adderId, targetId: targetUserId, type: relationshipFromManualToAdder } },
                       create: { initiatorId: adderId, targetId: targetUserId, type: relationshipFromManualToAdder },
                       update: {}, // No update needed if it exists
                   });
                   // Create reciprocal relationship: Target -> Adder
                   await context.prisma.relationship.upsert({
                        where: { initiatorId_targetId_type: { initiatorId: targetUserId, targetId: adderId, type: reciprocalType } },
                       create: { initiatorId: targetUserId, targetId: adderId, type: reciprocalType },
                       update: {},
                   });
                    console.log(`Created relationships (${relationshipFromManualToAdder}/${reciprocalType}) between Adder ${adderId} and Target ${targetUserId}`);
               } else {
                   console.warn(`Could not determine reciprocal relationship for type: ${relationshipFromManualToAdder}`);
               }
           } else {
               console.warn(`Manual member ${manualMemberId} has no relationshipToAdder defined, cannot create relationships automatically.`);
           }

           return true; // Indicate success

       } catch (error: any) {
           console.error("Link Manual Member Error:", error);
            if (error instanceof GraphQLError) throw error; // Re-throw known GraphQL errors
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                 throw new GraphQLError('A relationship of this type already exists between these users.', { extensions: { code: 'BAD_REQUEST' } });
            }
           throw new GraphQLError('Could not link manual member to user.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
   },

   createRelationship: async (_parent: any, { input }: CreateRelationshipInput, context: Context) => {
       requireAuth(context.currentUser);
       const initiatorId = context.currentUser.id;
       const { targetId, type } = input;

       if (initiatorId === targetId) {
           throw new GraphQLError('Cannot create a relationship with yourself.', { extensions: { code: 'BAD_USER_INPUT' } });
       }

       // Check if target user exists
       const targetUser = await context.prisma.user.findUnique({ where: { id: targetId }});
       if (!targetUser) {
            throw new GraphQLError('Target user not found.', { extensions: { code: 'NOT_FOUND' } });
       }

       // Determine the reciprocal relationship type
       let reciprocalType: RelationshipType | null = null;
       switch (type) {
           case RelationshipType.PARENT: reciprocalType = RelationshipType.CHILD; break;
           case RelationshipType.CHILD: reciprocalType = RelationshipType.PARENT; break;
           case RelationshipType.SPOUSE: reciprocalType = RelationshipType.SPOUSE; break; // Spouses are reciprocal
           case RelationshipType.SIBLING: reciprocalType = RelationshipType.SIBLING; break; // Siblings are reciprocal
           // Add other reciprocal types if needed
       }

       if (!reciprocalType) {
            throw new GraphQLError(`Unsupported or non-reciprocal relationship type: ${type}`, { extensions: { code: 'BAD_USER_INPUT' } });
       }

       try {
           // Use transaction to create both relationships or none
           const [relationship, reciprocalRelationship] = await context.prisma.$transaction([
               // Create Initiator -> Target relationship
               context.prisma.relationship.create({
                   data: { initiatorId, targetId, type }
               }),
               // Create Target -> Initiator reciprocal relationship
               context.prisma.relationship.create({
                   data: { initiatorId: targetId, targetId: initiatorId, type: reciprocalType }
               })
           ]);
           console.log(`Created relationship ${type} from ${initiatorId} to ${targetId} and reciprocal ${reciprocalType}`);
           return relationship; // Return the primary relationship created

       } catch (error) {
            console.error("Create Relationship Error:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                 // This usually means the unique constraint (initiatorId_targetId_type) failed
                 throw new GraphQLError('A relationship of this type already exists between these users.', { extensions: { code: 'BAD_REQUEST' } });
            }
            throw new GraphQLError('Could not create relationship.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
   },

   deleteRelationship: async (_parent: any, args: { relationshipId: string }, context: Context) => {
        requireAuth(context.currentUser);
        const currentUserId = context.currentUser.id;
        const { relationshipId } = args;

        // Find the relationship and its reciprocal
        const relationship = await context.prisma.relationship.findUnique({
            where: { id: relationshipId },
        });

        if (!relationship) {
            throw new GraphQLError('Relationship not found.', { extensions: { code: 'NOT_FOUND' } });
        }

        // Authorization: Only the initiator or target can delete? Or just initiator? Let's say initiator only for now.
        if (relationship.initiatorId !== currentUserId) {
             throw new GraphQLError('You can only delete relationships you initiated.', { extensions: { code: 'FORBIDDEN' } });
        }

        // Find the reciprocal relationship to delete as well
        let reciprocalType: RelationshipType | null = null;
        switch (relationship.type) {
            case RelationshipType.PARENT: reciprocalType = RelationshipType.CHILD; break;
            case RelationshipType.CHILD: reciprocalType = RelationshipType.PARENT; break;
            case RelationshipType.SPOUSE: reciprocalType = RelationshipType.SPOUSE; break;
            case RelationshipType.SIBLING: reciprocalType = RelationshipType.SIBLING; break;
        }

       try {
            await context.prisma.$transaction(async (tx) => {
                // Delete the primary relationship
                await tx.relationship.delete({
                    where: { id: relationshipId },
                });
                console.log(`Deleted relationship ${relationshipId} (${relationship.type})`);

                // Delete the reciprocal relationship if found
                if (reciprocalType) {
                    const reciprocal = await tx.relationship.findUnique({
                         where: { initiatorId_targetId_type: { initiatorId: relationship.targetId, targetId: relationship.initiatorId, type: reciprocalType } },
                    });
                    if (reciprocal) {
                        await tx.relationship.delete({
                            where: { id: reciprocal.id }
                        });
                        console.log(`Deleted reciprocal relationship ${reciprocal.id} (${reciprocalType})`);
                    } else {
                         console.warn(`Reciprocal relationship (${reciprocalType}) not found for ${relationshipId}`);
                    }
                }
            });

           return true; // Indicate success
       } catch (error) {
            console.error("Delete Relationship Error:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                // Record to delete not found (might have been deleted already)
                throw new GraphQLError('Relationship not found.', { extensions: { code: 'NOT_FOUND' } });
            }
            throw new GraphQLError('Could not delete relationship.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
       }
   },

   // --- Placeholder Mutations for Content ---
   // createPost: (...) => { /* ... */ },
   // updatePost: (...) => { /* ... */ },
   // deletePost: (...) => { /* ... */ },
   // addComment: (...) => { /* ... */ },
   // deleteComment: (...) => { /* ... */ },
};