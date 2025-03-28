'use client'; // For hooks

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation'; // Use useParams for App Router
import useAuth from '../../../hooks/useAuth';
import Link from 'next/link';
import Button from '../../../components/ui/Button'; // For potential future actions

// Query to fetch a single personal tree by ID
const GET_PERSONAL_TREE_QUERY = gql`
  query GetPersonalFamilyTree($id: ID!) {
    getPersonalFamilyTree(id: $id) {
      id
      name
      description
      owner {
        id
        firstName
      }
      treeData # The JSON data
      createdAt
      updatedAt
    }
  }
`;

export default function PersonalTreeDetailPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams(); // Get route parameters
  const treeId = params?.treeId as string; // Extract treeId (type assertion)

  // Query hook
  const { data, loading: queryLoading, error } = useQuery(GET_PERSONAL_TREE_QUERY, {
    variables: { id: treeId },
    skip: !isLoggedIn || !treeId, // Skip if not logged in or no ID yet
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
       if (error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
            router.push(`/login?redirect=/personal-trees/${treeId}`);
       } else if (error.graphQLErrors.some(err => err.extensions?.code === 'FORBIDDEN' || err.extensions?.code === 'NOT_FOUND')) {
           // Handle cases where tree doesn't exist or user doesn't own it
           console.error("Tree not found or access denied:", error.message);
           // Optionally redirect to the list page or show a specific error message
           // router.push('/personal-trees');
       } else {
            console.error("Error fetching personal tree detail:", error);
       }
   }
  });

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/login?redirect=/personal-trees/${treeId}`);
    }
  }, [authLoading, isLoggedIn, router, treeId]);

  const isLoading = authLoading || (isLoggedIn && queryLoading);

  if (isLoading) {
    return <p className="text-center mt-20">Carregando detalhes da árvore...</p>;
  }
   if (!isLoggedIn) {
       return <p className="text-center mt-20">Autenticação necessária.</p>;
   }

   // Handle specific errors after loading
    if (error && (error.message.includes('not found') || error.message.includes('authorized'))) {
         return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-xl font-bold text-red-600 mb-4">Árvore Não Encontrada</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    A árvore que você está tentando acessar não foi encontrada ou você não tem permissão para visualizá-la.
                </p>
                <Link href="/personal-trees" legacyBehavior>
                    <a className="text-indigo-600 hover:underline">Voltar para Minhas Árvores</a>
                </Link>
            </div>
        );
    }
    // Handle other generic errors
   if (error) {
       return <p className="text-center mt-10 text-red-600">Erro ao carregar detalhes: {error.message}</p>;
   }

   if (!data?.getPersonalFamilyTree) {
       return <p className="text-center mt-10">Detalhes da árvore não disponíveis.</p>;
   }


  const tree = data.getPersonalFamilyTree;

  return (
    <div className="container mx-auto px-4 py-8">
        <Link href="/personal-trees" legacyBehavior>
            <a className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">
                ← Voltar para Minhas Árvores
            </a>
        </Link>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tree.name}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{tree.description || 'Sem descrição.'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
            Criada em: {new Date(tree.createdAt).toLocaleString()} | Última atualização: {new Date(tree.updatedAt).toLocaleString()}
        </p>
        {/* Add Edit/Delete Buttons here later */}
         {/* <Button variant="secondary" className="mt-4 mr-2">Editar</Button> */}
         {/* <Button variant="secondary" className="mt-4" onClick={() => {/* Add delete logic */}}>Excluir</Button> */}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Dados da Árvore (JSON)</h2>
         {tree.treeData ? (
            <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto">
                {JSON.stringify(tree.treeData, null, 2)}
            </pre>
         ) : (
            <p className="text-gray-600 dark:text-gray-400">Nenhum dado estruturado foi salvo para esta árvore ainda.</p>
         )}
         <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
             Nota: Estes são os dados brutos. Uma visualização ou interface de edição para estes dados precisa ser implementada.
         </p>
      </div>

       {/* Placeholder for future visualization/editing component */}
       {/* <div className="mt-8 border border-dashed border-gray-400 p-8 text-center text-gray-500">
            [Componente de Edição/Visualização da Árvore Personalizada aqui]
        </div> */}
    </div>
  );
}