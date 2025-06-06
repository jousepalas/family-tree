// src/server/graphql/resolvers/index.ts
import { Query } from './Query';
import { Mutation } from './Mutation';
import { User } from './User'; // Resolvers for nested User fields
import { ManualFamilyMember } from './ManualFamilyMember'; // Resolvers for nested ManualFamilyMember fields
import { Relationship } from './Relationship'; // Resolvers for nested Relationship fields
// import { Post } from './Post'; // Resolvers for nested Post fields
// import { Comment } from './Comment'; // Resolvers for nested Comment fields
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';

export const resolvers = {
  // Scalars
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,

  // Root Types
  Query,
  Mutation,

  // Type Resolvers (for nested fields or complex logic)
  User,
  ManualFamilyMember,
  Relationship,
  // Post,
  // Comment,
  // Add other type resolvers as needed (e.g., FamilyTreeNode if complex logic required)
};