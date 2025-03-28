'use client';

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Mutation to create a personal tree
const CREATE_PERSONAL_TREE_MUTATION = gql`
  mutation CreatePersonalFamilyTree($input: CreatePersonalTreeInput!) {
    createPersonalFamilyTree(input: $input) {
      id
      name
      description
      createdAt
    }
  }
`;

interface CreatePersonalTreeFormProps {
    onSuccess?: (data: any) => void; // Optional callback on success
}


const CreatePersonalTreeForm: React.FC<CreatePersonalTreeFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [createTree, { loading, error, data: successData }] = useMutation(CREATE_PERSONAL_TREE_MUTATION, {
     onCompleted: (data) => {
        console.log('Personal tree created:', data);
        setName('');
        setDescription('');
         if(onSuccess) {
            onSuccess(data); // Call success callback if provided
        }
        // Refetch the list of trees on the parent page via callback or direct refetch
    },
    onError: (error) => {
        console.error('Error creating personal tree:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { name, description: description || null }; // Send null if description is empty
    await createTree({ variables: { input } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 p-4 border rounded dark:border-gray-700">
       <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        Criar Nova Árvore Personalizada
      </h3>

        {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
           Erro: {error.message}
         </div>
       )}
        {successData && !error && (
             <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                Árvore "{successData.createPersonalFamilyTree.name}" criada com sucesso!
            </div>
        )}

      <Input
        label="Nome da Árvore"
        id="tree-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ex: Árvore dos Avós Paternos"
      />
      <Input
        label="Descrição (Opcional)"
        id="tree-description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: Foco nos descendentes de João Silva"
      />
       <div>
        <Button type="submit" isLoading={loading} disabled={loading}>
          Criar Árvore
        </Button>
      </div>
    </form>
  );
};

export default CreatePersonalTreeForm;