'use client'; // Necessário para hooks

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Definição da Mutation GraphQL (deve corresponder ao seu schema)
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
      }
    }
  }
`;

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Hook useMutation do Apollo Client
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Salva o token no localStorage ao completar com sucesso
      if (data?.login?.token) {
        localStorage.setItem('authToken', data.login.token);
        console.log('Login successful, token saved.');
        // Redireciona para a página de perfil ou dashboard
        router.push('/profile');
        // Forçar um refresh pode ajudar a Navbar a atualizar imediatamente,
        // mas idealmente usar um estado global (Context, Zustand)
         window.location.reload(); // Ou use um estado global para atualizar a Navbar
      }
    },
    onError: (error) => {
      // Tratamento de erro já é feito pela variável 'error' do hook
      console.error('Login error:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting login:', { email }); // Log para debug
    try {
      await login({ variables: { email, password } });
    } catch (err) {
      // Erros de rede ou outros erros não pegos pelo onError do Apollo
      console.error('An unexpected error occurred during login:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
           <strong className="font-bold">Erro!</strong>
           {/* Idealmente, mapear códigos de erro para mensagens amigáveis */}
           <span className="block sm:inline"> {error.message}</span>
         </div>
       )}
      <Input
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Senha"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <div>
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Entrar
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;