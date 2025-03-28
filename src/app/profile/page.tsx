'use client'; // Necessário para hooks

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { resetApolloClient } from '../../lib/apolloClient';

// Query para buscar dados do usuário logado
const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      birthDate
      deathDate
      father {
        id
      }
      mother {
        id
      }
      # Adicione outros campos que deseja exibir/editar
    }
  }
`;

// Mutation para atualizar dados do usuário
const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      birthDate
      deathDate
      father {
        id
      }
      mother {
        id
      }
      # Retorna os campos atualizados
    }
  }
`;

// Define um tipo para os dados do formulário de atualização
interface UpdateFormData {
    firstName: string;
    lastName: string;
    birthDate: string;
    deathDate: string;
    fatherId: string;
    motherId: string;
}


export default function ProfilePage() {
  const router = useRouter();
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
      fetchPolicy: 'cache-and-network', // Garante que busca dados frescos mas usa cache se disponível
       onError: (error) => {
           // Se erro de autenticação, redireciona para login
           if (error.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
                console.log("User not authenticated, redirecting to login...");
                localStorage.removeItem('authToken'); // Limpa token inválido
                resetApolloClient();
                router.push('/login');
           }
       }
  });

  const [updateUser, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_MUTATION, {
       refetchQueries: [{ query: ME_QUERY }], // Re-busca dados do usuário após atualização
       awaitRefetchQueries: true,
       onCompleted: () => {
           console.log("Profile updated successfully!");
           // Poderia mostrar uma mensagem de sucesso
       },
        onError: (error) => {
            console.error("Error updating profile:", error);
        }
  });

  const [formData, setFormData] = useState<UpdateFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
    fatherId: '',
    motherId: '',
  });
   const [isEditing, setIsEditing] = useState(false); // Controla visibilidade do form

  // Preenche o formulário quando os dados do 'me' são carregados
  useEffect(() => {
    if (meData?.me) {
      const user = meData.me;
      // Formata datas para o input type="date" (YYYY-MM-DD) ou deixa vazio
      const formatToDateInput = (dateString: string | null | undefined) =>
          dateString ? new Date(dateString).toISOString().split('T')[0] : '';

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        birthDate: formatToDateInput(user.birthDate),
        deathDate: formatToDateInput(user.deathDate),
        fatherId: user.fatherId || '',
        motherId: user.motherId || '',
      });
    }
  }, [meData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating profile with data:', formData);

     const input = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // Envia datas como ISO string ou null se vazias
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : null,
        // Envia IDs como string ou null se vazios
        fatherId: formData.fatherId || null,
        motherId: formData.motherId || null,
     };

    try {
        await updateUser({ variables: { input } });
        setIsEditing(false); // Fecha o formulário após salvar
    } catch (err) {
        console.error("Unexpected error during profile update:", err);
    }
  };

   const handleLogout = () => {
    localStorage.removeItem('authToken');
    resetApolloClient();
    router.push('/login');
  };

  if (meLoading) return <p className="text-center mt-10">Carregando perfil...</p>;
  // Se houve erro não relacionado à autenticação
  if (meError && !meError.graphQLErrors.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
      return <p className="text-center mt-10 text-red-600">Erro ao carregar perfil: {meError.message}</p>;
  }
  // Se não está carregando e não tem dados (pode acontecer brevemente antes do redirect do onError)
   if (!meData?.me && !meLoading) {
       return <p className="text-center mt-10">Não foi possível carregar os dados do usuário.</p>;
   }


  const user = meData?.me;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Meu Perfil</h1>
          {user && (
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Nome:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nascimento:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Não informado'}</p>
                <p><strong>Falecimento:</strong> {user.deathDate ? new Date(user.deathDate).toLocaleDateString() : 'Não informado'}</p>
                <p><strong>ID Pai:</strong> {user.fatherId || 'Não informado'}</p>
                <p><strong>ID Mãe:</strong> {user.motherId || 'Não informado'}</p>
            </div>
          )}
           <Button onClick={() => setIsEditing(!isEditing)} className="mt-4 mr-2" variant="secondary">
                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
            </Button>
          <Button onClick={handleLogout} variant="secondary" className="mt-4">
                Logout
          </Button>
      </div>


        {/* Formulário de Edição (Condicional) */}
        {isEditing && (
             <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editar Informações</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {updateError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        Erro ao atualizar: {updateError.message}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nome" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <Input label="Sobrenome" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Input label="Data de Nascimento" id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                         <Input label="Data de Falecimento" id="deathDate" name="deathDate" type="date" value={formData.deathDate} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="ID do Pai" id="fatherId" name="fatherId" value={formData.fatherId} onChange={handleChange} />
                        <Input label="ID da Mãe" id="motherId" name="motherId" value={formData.motherId} onChange={handleChange} />
                    </div>
                    <Button type="submit" isLoading={updateLoading} disabled={updateLoading}>
                        Salvar Alterações
                    </Button>
                </form>
            </div>
        )}
    </div>
  );
}