'use client'; // For hooks

import React from 'react';
import { useRouter } from 'next/navigation';
import AddPlaceholderForm from '../../components/forms/AddPlaceholderForm'; // Ajuste o caminho se necessário
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';

export default function AddRelativePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in and not loading
  React.useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login?redirect=/add-relative'); // Redirect to login, saving intended destination
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    // Show loading or return null while redirecting
    return <p className="text-center mt-20">Carregando...</p>;
  }

  // Handler for successful addition (optional)
  const handleSuccess = (data: any) => {
    console.log("Placeholder added successfully from page:", data);
    // Maybe show a success message on the page or redirect
    // router.push('/profile'); // Example redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Adicionar Parente</h1>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <AddPlaceholderForm onSuccess={handleSuccess} />
        </div>

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
                Esta funcionalidade permite adicionar registros básicos para pessoas que ainda não se cadastraram (como ancestrais).
            </p>
            <p>
                Para conectar-se a parentes que <span className="font-semibold">já possuem cadastro</span>, você precisará de uma funcionalidade de busca e solicitação de conexão (a ser implementada). Veja também a opção de definir Pai/Mãe no seu <Link href="/profile" className="text-indigo-600 hover:underline">Perfil</Link>.
            </p>
        </div>
    </div>
  );
}