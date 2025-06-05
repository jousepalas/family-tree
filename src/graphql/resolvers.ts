import { PrismaClient, UserStatus, RelStatus, ParentType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { Context } from './context'; // Interface para o contexto (prisma, user)

// Assumindo que você tem uma instância do PrismaClient em lib/prisma.ts
import prisma from '../lib/prisma';
// Assumindo funções de hash e token em lib/auth.ts
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';

// Chave secreta para JWT (do .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Interfaces para o react-family-tree
interface FamilyNode {
    id: string;
    gender: 'male' | 'female';
    parents: string[];
    children: string[];
    siblings: string[];
    spouses: string[];
    // Campos personalizados para nossa aplicação
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    deathDate?: string;
}

interface FamilyTreeData {
    nodes: FamilyNode[];
}

// Função auxiliar para determinar o gênero baseado em relacionamentos
const inferGender = (user: any, relationships: any[]): 'male' | 'female' => {
    // Primeiro, verifica se é pai ou mãe de alguém
    const isParent = relationships.some(rel => 
      (rel.type === 'PARENT' && rel.initiatingUserId === user.id) ||
      (rel.type === 'CHILD' && rel.targetUserId === user.id)
    );
  
    // Se for pai/mãe, pode inferir pelo tipo de relacionamento
    // Por enquanto, vamos usar uma heurística simples ou campo adicional
    // Você pode adicionar um campo 'gender' no modelo User para ser mais preciso
    return 'male'; // Default - considere adicionar campo gender no banco
};

// Função auxiliar para buscar todos os membros da família recursivamente
const getAllFamilyMembers = async (startUserId: string, maxDepth: number = 3): Promise<any[]> => {
    const visited = new Set<string>();
    const users: any[] = [];
  
    const fetchUserAndRelations = async (userId: string, currentDepth: number) => {
      if (visited.has(userId) || currentDepth > maxDepth) return;
    
      visited.add(userId);
    
      // Busca o usuário com todas as relações
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          father: true,
          mother: true,
        }
      });
    
      if (!user) return;
    
      users.push(user);
    
      // Busca relacionamentos explícitos
      const relationships = await prisma.relationship.findMany({
        where: {
          OR: [
            { initiatingUserId: userId, status: RelStatus.CONFIRMED },
            { targetUserId: userId, status: RelStatus.CONFIRMED }
          ]
        },
        include: {
          initiatingUser: true,
          targetUser: true
        }
      });
    
      // Busca filhos
      const children = await prisma.user.findMany({
        where: {
          OR: [
            { fatherId: userId },
            { motherId: userId }
          ]
        }
      });
    
      // Recursivamente busca parentes
      const relatedUserIds = new Set<string>();
    
      // Adiciona pais
      if (user.fatherId) relatedUserIds.add(user.fatherId);
      if (user.motherId) relatedUserIds.add(user.motherId);
    
      // Adiciona filhos
      children.forEach(child => relatedUserIds.add(child.id));
    
      // Adiciona relacionamentos
      relationships.forEach(rel => {
        const relatedId = rel.initiatingUserId === userId ? rel.targetUserId : rel.initiatingUserId;
        relatedUserIds.add(relatedId);
      });
    
      // Busca recursivamente
      for (const relatedId of relatedUserIds) {
        await fetchUserAndRelations(relatedId, currentDepth + 1);
      }
    };
  
    await fetchUserAndRelations(startUserId, 0);
    return users;
};

// Função para transformar dados do Prisma para formato react-family-tree
const transformToFamilyTreeFormat = async (users: any[]): Promise<FamilyTreeData> => {
    const userMap = new Map(users.map(user => [user.id, user]));
  
    // Busca todos os relacionamentos para os usuários encontrados
    const allUserIds = users.map(u => u.id);
    const allRelationships = await prisma.relationship.findMany({
      where: {
        AND: [
          { status: RelStatus.CONFIRMED },
          {
            OR: [
              { initiatingUserId: { in: allUserIds } },
              { targetUserId: { in: allUserIds } }
            ]
          }
        ]
      }
    });
  
    const nodes: FamilyNode[] = users.map(user => {
      // Encontra pais
      const parents: string[] = [];
      if (user.fatherId && userMap.has(user.fatherId)) {
        parents.push(user.fatherId);
      }
      if (user.motherId && userMap.has(user.motherId)) {
        parents.push(user.motherId);
      }
    
      // Encontra filhos
      const children = users
        .filter(u => u.fatherId === user.id || u.motherId === user.id)
        .map(u => u.id);
    
      // Encontra irmãos (mesmos pais)
      const siblings = users
        .filter(u => 
          u.id !== user.id && 
          ((u.fatherId && u.fatherId === user.fatherId) || 
           (u.motherId && u.motherId === user.motherId))
        )
        .map(u => u.id);
    
      // Encontra cônjuges
      const spouses = allRelationships
        .filter(rel => 
          rel.type === 'SPOUSE' && 
          (rel.initiatingUserId === user.id || rel.targetUserId === user.id)
        )
        .map(rel => rel.initiatingUserId === user.id ? rel.targetUserId : rel.initiatingUserId)
        .filter(id => userMap.has(id));
    
      return {
        id: user.id,
        gender: inferGender(user, allRelationships),
        parents,
        children,
        siblings,
        spouses,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate?.toISOString(),
        deathDate: user.deathDate?.toISOString(),
      };
    });
  
    return { nodes };
};

export const resolvers = {
    Query: {
      me: async (_parent: any, _args: any, context: Context) => {
        if (!context.user) {
          throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        return prisma.user.findUnique({ where: { id: context.user.id } });
      },

      user: async (_parent: any, { id }: { id: string }, context: Context) => {
         // Adicionar lógica de permissão se necessário (quem pode ver quem?)
        return prisma.user.findUnique({ where: { id } });
      },

      // ***** IMPLEMENTAÇÃO COMPLETA DA QUERY MAIS COMPLEXA *****
      getFamilyTreeData: async (_parent: any, { userId }: { userId: string }, context: Context) => {
        try {
          // Verifica se o usuário existe
          const startUser = await prisma.user.findUnique({ where: { id: userId } });
          if (!startUser) {
            throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
          }
        
          // Busca todos os membros da família recursivamente
          const allFamilyMembers = await getAllFamilyMembers(userId, 3); // Máximo 3 níveis de profundidade
        
          // Transforma para o formato esperado pelo react-family-tree
          const familyTreeData = await transformToFamilyTreeFormat(allFamilyMembers);
        
          return familyTreeData;
        
        } catch (error) {
          console.error('Error in getFamilyTreeData:', error);
          throw new GraphQLError('Failed to fetch family tree data', { 
            extensions: { code: 'INTERNAL_ERROR' } 
          });
        }
      },

      getUsersByFamilyCode: async (_parent: any, { familyCode }: { familyCode: string }, context: Context) => {
          return prisma.user.findMany({ where: { familyCode } });
      },

      getPersonalFamilyTrees: async (_parent: any, _args: any, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
          return prisma.personalFamilyTree.findMany({ where: { ownerId: context.user.id } });
      },

      getPersonalFamilyTree: async (_parent: any, { id }: { id: string }, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
          const tree = await prisma.personalFamilyTree.findUnique({ where: { id } });
          if (!tree || tree.ownerId !== context.user.id) {
              throw new GraphQLError('Tree not found or not authorized', { extensions: { code: 'FORBIDDEN' } });
          }
          return tree;
      },

       getPendingRelationships: async (_parent: any, _args: any, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
          return prisma.relationship.findMany({
              where: {
                  targetUserId: context.user.id,
                  status: RelStatus.PENDING,
                  // Garante que o target user seja registrado para poder confirmar
                  targetUser: { status: UserStatus.REGISTERED }
              },
              include: { initiatingUser: true, targetUser: true } // Inclui os usuários relacionados
          });
      },
       searchUsers: async (_parent: any, { query }: { query: string }, context: Context) => {
           if (!query || query.trim().length < 2) return []; // Evita buscas vazias/muito curtas
           return prisma.user.findMany({
               where: {
                   OR: [
                       { firstName: { contains: query, mode: 'insensitive' } },
                       { lastName: { contains: query, mode: 'insensitive' } },
                       { email: { contains: query, mode: 'insensitive' } },
                   ],
                   // Talvez filtrar apenas usuários REGISTERED?
                   // status: UserStatus.REGISTERED
               },
               take: 10 // Limita resultados
           });
       }

    },
    Mutation: {
      register: async (_parent: any, { input }: { input: any }) => {
        const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
        if (existingUser) {
          throw new GraphQLError('Email already exists', { extensions: { code: 'BAD_USER_INPUT' } });
        }

        const hashedPassword = await hashPassword(input.password);

        // Lógica do Family Code (Simplificada):
        // Se pais foram fornecidos e existem, tenta herdar o familyCode.
        // Precisa de uma regra mais robusta (ex: pega do pai? gera um novo pro casal?)
        let derivedFamilyCode = input.familyCode; // Usa o fornecido se houver
        if (!derivedFamilyCode && input.fatherId) {
            const father = await prisma.user.findUnique({where: {id: input.fatherId}});
            if (father?.familyCode) derivedFamilyCode = father.familyCode;
            // Adicionar lógica se a mãe tiver um código diferente ou se nenhum tiver
        }
        // Se ainda não tem código e não foi fornecido, pode ficar null ou gerar um novo.

        const newUser = await prisma.user.create({
          data: {
            ...input,
            password: hashedPassword,
            familyCode: derivedFamilyCode, // Aplica o código derivado/fornecido
            status: UserStatus.REGISTERED,
            // Remove password from input before spreading if necessary
            birthDate: input.birthDate ? new Date(input.birthDate) : null,
          },
        });

        const token = generateToken({ userId: newUser.id });
        return { token, user: newUser };
      },

      login: async (_parent: any, { email, password }: { email: String, password: String }) => {
          const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
          if (!user || user.status !== UserStatus.REGISTERED) {
              throw new GraphQLError('Invalid credentials or user not active', { extensions: { code: 'UNAUTHENTICATED' } });
          }

          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
              throw new GraphQLError('Invalid credentials', { extensions: { code: 'UNAUTHENTICATED' } });
          }

          const token = generateToken({ userId: user.id });
          return { token, user };
      },

      updateUser: async (_parent: any, { input }: { input: any }, context: Context) => {
           if (!context.user) throw new GraphQLError('Not authenticated');

           // Lógica de atualização do familyCode se pai/mãe mudarem
           let familyCode = context.user.familyCode;
           if(input.fatherId && input.fatherId !== context.user.fatherId) {
              const father = await prisma.user.findUnique({ where: { id: input.fatherId } });
              if(father?.familyCode) familyCode = father.familyCode; // Regra simplificada
           }
           // Adicionar lógica se mãe for alterada...

           return prisma.user.update({
               where: { id: context.user.id },
               data: {
                   ...input,
                   familyCode, // Atualiza o código se necessário
                   birthDate: input.birthDate ? new Date(input.birthDate) : undefined, // Converte para Date se fornecido
                   deathDate: input.deathDate ? new Date(input.deathDate) : undefined,
               },
           });
       },

       addPlaceholderUser: async (_parent: any, { input }: { input: any }, context: Context) => {
           if (!context.user) throw new GraphQLError('Not authenticated');
           // Placeholders não tem email/senha
           return prisma.user.create({
               data: {
                   ...input,
                   email: `placeholder_${Date.now()}@family.app`, // Email único fake
                   password: '', // Sem senha
                   status: UserStatus.PLACEHOLDER,
                   birthDate: input.birthDate ? new Date(input.birthDate) : null,
                   deathDate: input.deathDate ? new Date(input.deathDate) : null,
               }
           });
       },

      addRelationship: async (_parent: any, { input }: { input: any }, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
          const { targetUserId, type } = input;

          if(context.user.id === targetUserId) {
               throw new GraphQLError('Cannot add relationship to self', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
          if (!targetUser) {
              throw new GraphQLError('Target user not found', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Verifica se a relação inversa já existe
          const existingInverse = await prisma.relationship.findFirst({
              where: { initiatingUserId: targetUserId, targetUserId: context.user.id, type }
          });
          if(existingInverse && existingInverse.status === RelStatus.CONFIRMED) {
               throw new GraphQLError('Relationship already exists (inverse)', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Define o status inicial
          // Se o alvo for placeholder, confirma automaticamente? Ou deixa pendente para revisão?
          // Vamos deixar PENDING por enquanto. Pode ser confirmado manualmente se necessário.
          const initialStatus = targetUser.status === UserStatus.PLACEHOLDER ? RelStatus.CONFIRMED : RelStatus.PENDING; // Decisão de design

          return prisma.relationship.create({
              data: {
                  initiatingUserId: context.user.id,
                  targetUserId: targetUserId,
                  type: type,
                  status: initialStatus,
              },
              include: { initiatingUser: true, targetUser: true }
          });
      },

      confirmRelationship: async (_parent: any, { relationshipId }: { relationshipId: string }, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');

          const relationship = await prisma.relationship.findUnique({ where: { id: relationshipId } });

          if (!relationship || relationship.targetUserId !== context.user.id || relationship.status !== RelStatus.PENDING) {
              throw new GraphQLError('Relationship not found, not targeted to you, or not pending', { extensions: { code: 'BAD_REQUEST' } });
          }

          const updatedRelationship = await prisma.relationship.update({
              where: { id: relationshipId },
              data: { status: RelStatus.CONFIRMED },
              include: { initiatingUser: true, targetUser: true }
          });

          // Conceder badge ao iniciador
          await prisma.user.update({
              where: { id: relationship.initiatingUserId },
              data: {
                  badges: {
                      // Adiciona 'Contributor' se ainda não existir
                      push: 'Contributor', // Use `set` se quiser garantir unicidade de forma mais complexa
                  }
              }
          });
          // TODO: Potencialmente criar a relação inversa automaticamente (ex: se A confirma B como irmão, B é irmão de A)

          return updatedRelationship;
      },

      rejectRelationship: async (_parent: any, { relationshipId }: { relationshipId: string }, context: Context) => {
           if (!context.user) throw new GraphQLError('Not authenticated');
           const relationship = await prisma.relationship.findUnique({ where: { id: relationshipId } });

           if (!relationship || relationship.targetUserId !== context.user.id || relationship.status !== RelStatus.PENDING) {
               throw new GraphQLError('Relationship not found, not targeted to you, or not pending', { extensions: { code: 'BAD_REQUEST' } });
           }

           return prisma.relationship.update({
               where: { id: relationshipId },
               data: { status: RelStatus.REJECTED },
               include: { initiatingUser: true, targetUser: true }
           });
       },

       assignParent: async (_parent: any, { childId, parentId, type }: { childId: string, parentId: string, type: ParentType }, context: Context) => {
           if (!context.user) throw new GraphQLError('Not authenticated');
           // TODO: Adicionar lógica de permissão - quem pode definir pais de quem? Admin? O próprio usuário? O pai/mãe?

           const child = await prisma.user.findUnique({ where: { id: childId } });
           const parent = await prisma.user.findUnique({ where: { id: parentId } });

           if (!child || !parent) {
               throw new GraphQLError('Child or Parent not found', { extensions: { code: 'BAD_USER_INPUT' } });
           }

           const dataToUpdate: any = {};
           if (type === ParentType.FATHER) {
               dataToUpdate.fatherId = parentId;
           } else {
               dataToUpdate.motherId = parentId;
           }

           // Atualiza familyCode do filho baseado no novo pai/mãe (regra simplificada: usa o do pai se definir pai)
           if (type === ParentType.FATHER && parent.familyCode) {
               dataToUpdate.familyCode = parent.familyCode;
               // TODO: Considerar atualizar familyCode dos descendentes do child recursivamente? (Complexo!)
           }
            // Adicionar lógica se definir mãe e ela tiver código diferente, etc.

           return prisma.user.update({
               where: { id: childId },
               data: dataToUpdate,
           });
       },

       createPersonalFamilyTree: async (_parent: any, { input }: { input: any }, context: Context) => {
           if (!context.user) throw new GraphQLError('Not authenticated');
           return prisma.personalFamilyTree.create({
               data: {
                   ...input,
                   ownerId: context.user.id,
               }
           });
       },
       // Implementar update e delete para PersonalFamilyTree de forma similar...
       updatePersonalFamilyTree: async (_parent: any, { id, input }: { id: string, input: any }, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
          // Verificar se a árvore pertence ao usuário antes de atualizar
          const existingTree = await prisma.personalFamilyTree.findUnique({ where: { id } });
          if (!existingTree || existingTree.ownerId !== context.user.id) {
              throw new GraphQLError('Tree not found or not authorized', { extensions: { code: 'FORBIDDEN' } });
          }
          return prisma.personalFamilyTree.update({
              where: { id },
              data: input
          });
       },
      deletePersonalFamilyTree: async (_parent: any, { id }: { id: string }, context: Context) => {
          if (!context.user) throw new GraphQLError('Not authenticated');
           // Verificar se a árvore pertence ao usuário antes de deletar
           const existingTree = await prisma.personalFamilyTree.findUnique({ where: { id } });
           if (!existingTree || existingTree.ownerId !== context.user.id) {
               throw new GraphQLError('Tree not found or not authorized', { extensions: { code: 'FORBIDDEN' } });
           }
          await prisma.personalFamilyTree.delete({ where: { id } });
          return true; // Indica sucesso
      },
    },

    // Resolvers para campos dentro dos Types (ex: buscar pais/filhos de um User)
    User: {
      father: async (parent: any, _args: any, context: Context) => {
          if (!parent.fatherId) return null;
          return prisma.user.findUnique({ where: { id: parent.fatherId } });
      },
      mother: async (parent: any, _args: any, context: Context) => {
          if (!parent.motherId) return null;
          return prisma.user.findUnique({ where: { id: parent.motherId } });
      },
      // Resolver para combinar relationshipsInitiated e relationshipsTargeted
       relationships: async (parent: any, _args: any, context: Context) => {
           const initiated = await prisma.relationship.findMany({
               where: { initiatingUserId: parent.id },
               include: { initiatingUser: true, targetUser: true }
           });
           const targeted = await prisma.relationship.findMany({
               where: { targetUserId: parent.id },
               include: { initiatingUser: true, targetUser: true }
           });
           // Combina e remove duplicatas se necessário (embora não devessem existir com o unique constraint)
           // Cuidado para não duplicar se A->B e B->A existirem com tipos diferentes.
           // A lógica exata de como combinar pode depender de como você quer exibir.
           return [...initiated, ...targeted]; // Simplificado
       },
       ownedPersonalTrees: async (parent: any, _args: any, context: Context) => {
          return prisma.personalFamilyTree.findMany({ where: { ownerId: parent.id } });
       }
      // Filhos podem ser buscados sob demanda ou aqui:
      // children: async (parent: any, _args: any, context: Context) => {
      //   const childrenAsFather = await prisma.user.findMany({ where: { fatherId: parent.id } });
      //   const childrenAsMother = await prisma.user.findMany({ where: { motherId: parent.id } });
      //   return [...childrenAsFather, ...childrenAsMother];
      // }
    },
    // Resolvers para campos dentro de Relationship, PersonalFamilyTree se necessário...
     Relationship: {
        initiatingUser: async (parent: any) => prisma.user.findUnique({ where: { id: parent.initiatingUserId } }),
        targetUser: async (parent: any) => prisma.user.findUnique({ where: { id: parent.targetUserId } }),
    },
     PersonalFamilyTree: {
        owner: async (parent: any) => prisma.user.findUnique({ where: { id: parent.ownerId } }),
    }
};