'use client';

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Mutation to add a placeholder user
const ADD_PLACEHOLDER_MUTATION = gql`
  mutation AddPlaceholderUser($input: AddPlaceholderInput!) {
    addPlaceholderUser(input: $input) {
      id
      firstName
      lastName
      status
    }
  }
`;

interface AddPlaceholderFormProps {
    onSuccess?: (data: any) => void; // Optional callback on success
}

const AddPlaceholderForm: React.FC<AddPlaceholderFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
  });

  const [addPlaceholder, { loading, error, data: successData }] = useMutation(ADD_PLACEHOLDER_MUTATION, {
    onCompleted: (data) => {
        console.log('Placeholder added:', data);
        setFormData({ firstName: '', lastName: '', birthDate: '', deathDate: '' }); // Reset form
        if(onSuccess) {
            onSuccess(data); // Call success callback if provided
        }
        // Consider refetching relevant queries if needed
    },
    onError: (error) => {
        console.error('Error adding placeholder:', error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : null,
    };
    await addPlaceholder({ variables: { input } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        Adicionar Pessoa (Não Cadastrada)
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Adicione informações sobre um parente que ainda não está no sistema (ex: ancestral).
      </p>

       {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
           Erro: {error.message}
         </div>
       )}
        {successData && !error && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                Pessoa adicionada com sucesso (ID: {successData.addPlaceholderUser.id})!
            </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome"
          id="add-firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Sobrenome"
          id="add-lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Data de Nascimento (Opcional)"
          id="add-birthDate"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
        />
        <Input
          label="Data de Falecimento (Opcional)"
          id="add-deathDate"
          name="deathDate"
          type="date"
          value={formData.deathDate}
          onChange={handleChange}
        />
      </div>
      <div>
        <Button type="submit" isLoading={loading} disabled={loading}>
          Adicionar Pessoa
        </Button>
      </div>
    </form>
  );
};

export default AddPlaceholderForm;