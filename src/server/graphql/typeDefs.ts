// src/server/graphql/typeDefs.ts
import { gql } from '@apollo/client';

// Using 'gql' tag for syntax highlighting and parsing
export const typeDefs = gql`
  scalar DateTime # Handles Date/Time serialization
  scalar JSON # For potentially unstructured data if needed

  enum Gender {
    MALE
    FEMALE
    NON_BINARY
    OTHER
    PREFER_NOT_SAY
  }

  enum RelationshipType {
    PARENT
    CHILD
    SPOUSE
    SIBLING
    # Add other types mirroring Prisma Enum if needed
  }

  enum PostType {
    AVISO
    ANUNCIO
    EVENTO
    HISTORIA
  }

  # --- Core Types ---

  type User {
    id: ID!
    name: String
    email: String
    emailVerified: DateTime
    image: String # Profile picture URL
    dateOfBirth: DateTime
    gender: Gender
    fatherName: String # User-provided name
    motherName: String # User-provided name
    phoneNumber: String
    countryCode: String
    country: String
    isProfilePublic: Boolean!
    inviteCode: String # User's code to invite others
    invitedBy: User # The user who invited this one (fetch explicitly if needed)
    createdAt: DateTime!
    updatedAt: DateTime!
    # Relationships and other nested data often fetched via specific queries
    # to avoid over-fetching and circular dependencies.
    # Example: relationships: [Relationship!]
    # Example: manualMembersAdded: [ManualFamilyMember!]
  }

  type ManualFamilyMember {
    id: ID!
    addedById: ID!
    addedBy: User! # User who added this member
    name: String!
    gender: Gender
    dateOfBirth: DateTime
    relationshipToAdder: RelationshipType # e.g., PARENT if user added their father
    linkedUserId: ID # ID of the User if linked
    linkedUser: User # The linked User profile (fetch explicitly if needed)
    createdAt: DateTime!
  }

  type Relationship {
    id: ID!
    initiatorId: ID!
    initiator: User! # User initiating the relationship perspective
    targetId: ID!
    target: User! # User being related to
    type: RelationshipType! # e.g., PARENT (initiator is parent of target)
    createdAt: DateTime!
  }

  type Post {
    id: ID!
    authorId: ID!
    author: User!
    type: PostType!
    title: String
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    notifyUntil: DateTime
    eventDate: DateTime
    eventLocation: String
    comments: [Comment!]! # Include comments directly or use pagination
  }

  type Comment {
    id: ID!
    postId: ID!
    post: Post!
    authorId: ID!
    author: User!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # --- Input Types ---

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
    dateOfBirth: DateTime
    gender: Gender
    fatherName: String
    motherName: String
    phoneNumber: String
    countryCode: String
    country: String
    inviteCode: String # Optional: Code used during registration
  }

  input UpdateUserProfileInput {
    name: String
    dateOfBirth: DateTime
    gender: Gender
    fatherName: String
    motherName: String
    phoneNumber: String
    countryCode: String
    country: String
    isProfilePublic: Boolean
    image: String # URL of the uploaded image (handle upload separately)
  }

  input AddManualMemberInput {
    name: String!
    gender: Gender
    dateOfBirth: DateTime
    relationshipToAdder: RelationshipType! # Relationship of the new person TO the logged-in user
  }

  input CreateRelationshipInput {
    targetId: ID!
    # Type of relationship FROM the logged-in user TO the target user
    # e.g., If adding your child, type is CHILD
    # e.g., If adding your spouse, type is SPOUSE
    type: RelationshipType!
  }

  input CreatePostInput {
    type: PostType!
    title: String
    content: String!
    notifyUntil: DateTime # For AVISO
    eventDate: DateTime   # For EVENTO
    eventLocation: String # For EVENTO
  }

   input AddCommentInput {
       postId: ID!
       content: String!
   }

  # --- Query Results ---

  # Structure for the Family Tree visualization library
  # Combines User and ManualFamilyMember data into a common node format
  type FamilyTreeNode {
    id: ID!           # User ID or ManualFamilyMember ID
    nodeId: String!   # Unique identifier for the tree library (e.g., "user-123", "manual-456")
    type: String!     # 'USER' or 'MANUAL'
    name: String!
    gender: Gender
    dateOfBirth: DateTime # For display/info
    imageUrl: String  # Profile image or placeholder
    # Tree structure links (IDs refer to other FamilyTreeNode.nodeId)
    parents: [String!] # List of parent node IDs
    spouses: [String!] # List of spouse node IDs
    children: [String!] # List of child node IDs (derived implicitly or explicitly)
  }

  type FamilyTreeData {
      nodes: [FamilyTreeNode!]!
      # Optional: Add relationships/links if the library needs them separately
      # links: [FamilyTreeLink!]
  }

  type SearchResult {
      id: ID!
      name: String!
      email: String # Only if allowed by privacy
      image: String
      type: String! # 'USER' or 'MANUAL' (if searching manual members too)
  }


  # --- Queries ---

  type Query {
    "Get the currently logged-in user's profile"
    me: User

    "Get a specific user's profile (respects privacy settings)"
    getUserProfile(userId: ID!): User

    "Get data formatted for the family tree visualization starting from a user"
    getFamilyTreeData(userId: ID!): FamilyTreeData!

    "Search for users (public profiles or within family context)"
    searchUsers(term: String!): [SearchResult!]!

    "Get manual members added by the current user"
    getMyManualMembers: [ManualFamilyMember!]!

    "Get relationships involving the current user"
    getMyRelationships: [Relationship!]!

    # Add queries for Posts, Events, etc. with pagination/filtering
    # getPosts(type: PostType, limit: Int, offset: Int): [Post!]!
    # getUpcomingEvents: [Post!]!
    # getRecentBirthdays: [User!]! # Needs calculation based on DOB
  }

  # --- Mutations ---

  type Mutation {
    "Register a new user"
    registerUser(input: RegisterUserInput!): User!

    "Update the profile of the currently logged-in user"
    updateProfile(input: UpdateUserProfileInput!): User!

    "Generate or retrieve the invite code for the current user"
    generateInviteCode: String!

    "Add a family member manually (not a registered user)"
    addManualMember(input: AddManualMemberInput!): ManualFamilyMember!

    "Link an existing ManualFamilyMember entry to a registered User (requires confirmation/permissions)"
    linkManualMemberToUser(manualMemberId: ID!, userId: ID!): Boolean!

    "Create a relationship between the current user and another registered user"
    createRelationship(input: CreateRelationshipInput!): Relationship!

    "Delete a relationship initiated by the current user"
    deleteRelationship(relationshipId: ID!): Boolean!

    # Add mutations for Posts, Comments, etc.
    # createPost(input: CreatePostInput!): Post!
    # updatePost(postId: ID!, input: UpdatePostInput!): Post!
    # deletePost(postId: ID!): Boolean!
    # addComment(input: AddCommentInput!): Comment!
    # deleteComment(commentId: ID!): Boolean!
  }
`;