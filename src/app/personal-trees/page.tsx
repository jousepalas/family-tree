'use client'; // For hooks

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';
import CreatePersonalTreeForm from '../../components/forms/CreatePersonalTreeForm';
import Button from '../../components/ui/Button'; // Import Button if needed separately

// Query to fetch personal trees
const GET_PERSONAL_TREES_QUERY = gql`
  query GetPersonalFamilyTrees {
    getPersonalFamilyTrees {
      id
      name
      description
      createdAt
    }
  }
`;

// Type for a single tree in the list
interface PersonalTree {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
}


export default function PersonalTreesPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Query hook
  const { data, loading: queryLoading, error, refetch } = useQuery(GET_PERSONAL_TREES_QUERY, {
    skip: !isLoggedIn, // Skip if not logged in
    fetchPolicy: 'cache-and-network',
     onError: (error) => {
       if (error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
            router.push('/login?redirect=/personal-trees');
       } else {
            console.error("Error fetching personal trees:", error);
       }
   }
  });

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?redirect=/personal-trees');
    }
  }, [authLoading, isLoggedIn, router]);

  const isLoading = authLoading || (isLoggedIn && queryLoading);

   // Callback for successful tree creation
   const handleTreeCreationSuccess = () => {
       refetch(); // Refetch the list of trees
   }

  if (isLoading) {
    return <p className="text-center mt-20">Carregando árvores...</p>;
  }
   if (!isLoggedIn) {
       // Should be redirecting, but show message just in case
       return <p className="text-center mt-20">Você precisa estar logado para ver suas árvores.</p>;
   }


  const trees: PersonalTree[] = data?.getPersonalFamilyTrees || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Minhas Árvores Personalizadas</h1>

       {error && !error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED') && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
           Erro ao carregar árvores: {error.message}
         </div>
       )}

      {/* List of Trees */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Árvores Salvas</h2>
        {trees.length > 0 ? (
          <ul className="space-y-3">
            {trees.map((tree) => (
              <li key={tree.id} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
                <Link href={`/personal-trees/${tree.id}`} legacyBehavior>
                  <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    {tree.name}
                  </a>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tree.description || 'Sem descrição'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Criada em: {new Date(tree.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Você ainda não criou nenhuma árvore personalizada.</p>
        )}
      </div>

      {/* Creation Form */}
       <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
           <CreatePersonalTreeForm onSuccess={handleTreeCreationSuccess} />
        </div>

    </div>
  );
}