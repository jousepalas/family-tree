'use client'; // Necessário para useEffect e useState

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use navigation para App Router
import { resetApolloClient } from '../../lib/apolloClient';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Verifica o estado de login no cliente
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []); // Executa apenas na montagem inicial no cliente

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove o token
    setIsLoggedIn(false);
    resetApolloClient(); // Limpa o cache do Apollo Client
    router.push('/login'); // Redireciona para login
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo ou Nome do App */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              FamilyTree
            </Link>
          </div>

          {/* Links de Navegação */}
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/tree" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Árvore
                </Link>
                <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Botão Mobile (pode ser implementado depois) */}
          <div className="md:hidden">
            {/* Ícone de Menu */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;