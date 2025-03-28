'use client'; // For hooks and client-side logic

import React from 'react';
import Link from 'next/link';
import useAuth from '../hooks/useAuth'; // We'll create this hook
export default function HomePage() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-center mt-20">Verificando autenticação...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
        Bem-vindo(a) ao FamilyTree App!
      </h1>

      {isLoggedIn ? (
        <div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Explore sua árvore genealógica e conecte-se com sua família.
          </p>
          <div className="space-x-4">
            <Link href="/tree" legacyBehavior>
              <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                Ver minha Árvore
              </a>
            </Link>
            <Link href="/profile" legacyBehavior>
              <a className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-300">
                Meu Perfil
              </a>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Registre-se ou faça login para começar a construir sua árvore genealógica.
          </p>
          <div className="space-x-4">
            <Link href="/login" legacyBehavior>
              <a className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                Login
              </a>
            </Link>
            <Link href="/register" legacyBehavior>
              <a className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition duration-300">
                Registrar
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}