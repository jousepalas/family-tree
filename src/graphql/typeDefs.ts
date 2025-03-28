import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar Json

  enum UserStatus {
    REGISTERED
    PLACEHOLDER
    INVITED
  }

  enum RelStatus {
    PENDING
    CONFIRMED
    REJECTED
  }

  enum RelationshipType {
    SIBLING
    SPOUSE
    COUSIN
    UNCLE
    AUNT
    # Adicione outros tipos conforme necessário
  }

  enum ParentType {
    FATHER
    MOTHER
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    birthDate: DateTime
    deathDate: DateTime
    familyCode: String
    status: UserStatus!
    badges: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relações diretas (pais)
    father: User
    mother: User

    # Relações diretas (filhos) - Pode ser computado ou buscado separadamente
    # children: [User!]

    # Relações explícitas (irmãos, cônjuges, etc.)
    relationships: [Relationship!] # Combina initiated e targeted

    # Árvores personalizadas
    ownedPersonalTrees: [PersonalFamilyTree!]
  }

  type Relationship {
    id: ID!
    type: String! # Idealmente usar o Enum RelationshipType
    status: RelStatus!
    initiatingUser: User!
    targetUser: User!
    createdAt: DateTime!
  }

  type PersonalFamilyTree {
    id: ID!
    name: String!
    description: String
    owner: User!
    treeData: Json
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Payload para Autenticação
  type AuthPayload {
    token: String!
    user: User!
  }

  # --- Inputs ---

  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    birthDate: DateTime
    familyCode: String # Opcional no registro inicial
    fatherId: ID       # Opcional no registro inicial
    motherId: ID       # Opcional no registro inicial
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    birthDate: DateTime
    deathDate: DateTime
    fatherId: ID
    motherId: ID
    # Não permitir mudar email ou senha aqui, criar mutations separadas
  }

  # Input para adicionar placeholders (pessoas não registradas)
  input AddPlaceholderInput {
    firstName: String!
    lastName: String!
    birthDate: DateTime
    deathDate: DateTime
    # Relações podem ser adicionadas depois via addRelationship
  }

  input AddRelationshipInput {
    targetUserId: ID!
    type: RelationshipType! # Usar o Enum
  }

  input CreatePersonalTreeInput {
    name: String!
    description: String
    treeData: Json # Estrutura inicial da árvore
  }

  input UpdatePersonalTreeInput {
    name: String
    description: String
    treeData: Json
  }

  # --- Queries ---
  type Query {
    me: User # Retorna o usuário logado
    user(id: ID!): User
    # Query principal para buscar dados da árvore - complexa!
    getFamilyTreeData(userId: ID!): Json # Retorna dados estruturados para o frontend
    getUsersByFamilyCode(familyCode: String!): [User!]
    getPersonalFamilyTrees: [PersonalFamilyTree!] # Do usuário logado
    getPersonalFamilyTree(id: ID!): PersonalFamilyTree
    getPendingRelationships: [Relationship!] # Relações pendentes para o usuário logado
    searchUsers(query: String!): [User!] # Busca por nome/email
  }

  # --- Mutations ---
  type Mutation {
    register(input: CreateUserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    updateUser(input: UpdateUserInput!): User! # Atualiza o usuário logado

    # Adiciona uma pessoa que (ainda) não está no sistema
    addPlaceholderUser(input: AddPlaceholderInput!): User!

    # Conecta dois usuários (ou placeholders) com uma relação específica
    addRelationship(input: AddRelationshipInput!): Relationship!

    # Ações sobre relações pendentes (usuário logado é o targetUser)
    confirmRelationship(relationshipId: ID!): Relationship!
    rejectRelationship(relationshipId: ID!): Relationship!

    # Define pai/mãe de um usuário (útil para placeholders ou correções)
    assignParent(childId: ID!, parentId: ID!, type: ParentType!): User!

    createPersonalFamilyTree(input: CreatePersonalTreeInput!): PersonalFamilyTree!
    updatePersonalFamilyTree(id: ID!, input: UpdatePersonalTreeInput!): PersonalFamilyTree!
    deletePersonalFamilyTree(id: ID!): Boolean!
  }
`;