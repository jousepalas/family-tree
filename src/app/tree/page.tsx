'use client'; // Necessário para hooks

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';

// Query para buscar dados do usuário logado (apenas ID)
const ME_ID_QUERY = gql`
  query MeId {
    me {
      id
    }
  }
`;

// Query principal para buscar dados da árvore
const GET_FAMILY_TREE_DATA_QUERY = gql`
  query GetFamilyTreeData($userId: ID!) {
    getFamilyTreeData(userId: $userId) # Supondo que retorna Json
  }
`;

export default function TreePage() {
    const router = useRouter();

    // 1. Busca o ID do usuário logado primeiro
    const { data: meData, loading: meLoading, error: meError } = useQuery(ME_ID_QUERY, {
        fetchPolicy: 'cache-first', // Pode usar cache aqui
         onError: (error) => {
           // Se erro de autenticação, redireciona para login
           if (error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
                console.log("User not authenticated for tree, redirecting to login...");
                // Não precisa limpar token aqui, pois a query ME no profile fará isso se necessário
                router.push('/login');
           }
       }
    });

    const userId = meData?.me?.id;

    // 2. Busca os dados da árvore APENAS se tiver o userId
    const { data: treeData, loading: treeLoading, error: treeError } = useQuery(
        GET_FAMILY_TREE_DATA_QUERY,
        {
            variables: { userId },
            skip: !userId, // Pula a query se userId ainda não estiver disponível
            fetchPolicy: 'cache-and-network', // Busca dados frescos para a árvore
        }
    );

    // --- Estados de Carregamento e Erro ---
    const isLoading = meLoading || (userId && treeLoading); // Está carregando se busca ME ou busca árvore (tendo ID)
    const error = meError || treeError;

    // --- Renderização ---
    if (isLoading) return <p className="text-center mt-10">Carregando árvore genealógica...</p>;

    // Se erro não for de autenticação
    if (error && !error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
        return <p className="text-center mt-10 text-red-600">Erro ao carregar árvore: {error.message}</p>;
    }

    // Se não está carregando, não teve erro fatal, mas não tem dados (pode acontecer em cenários específicos)
    if (!treeData?.getFamilyTreeData && userId && !isLoading) {
        return <p className="text-center mt-10">Não foram encontrados dados da árvore para este usuário.</p>;
    }
     // Se não tem ID de usuário (pode acontecer brevemente antes do redirect)
     if(!userId && !isLoading) {
         return <p className="text-center mt-10">Usuário não identificado.</p>;
     }

    return (
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sua Árvore Genealógica (Dados Brutos)</h1>

        {treeData?.getFamilyTreeData ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow">
            <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {JSON.stringify(treeData.getFamilyTreeData, null, 2)}
            </pre>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Nota: Esta é a representação JSON dos dados da árvore retornados pela API. A visualização gráfica precisa ser implementada.
            </p>
            </div>
        ) : (
             !isLoading && <p>Nenhum dado da árvore encontrado.</p> // Mensagem se getFamilyTreeData for null/undefined
        )}

        {/* Área reservada para o componente de visualização da árvore */}
        {/* <div className="mt-8 border border-dashed border-gray-400 p-8 text-center text-gray-500">
            [Componente de Visualização da Árvore (ex: react-family-tree, D3) será inserido aqui]
        </div> */}
        </div>
    );
}