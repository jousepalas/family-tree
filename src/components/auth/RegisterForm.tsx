'use client'; // Necessário para hooks

import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Definição da Mutation GraphQL (deve corresponder ao CreateUserInput e ao retorno)
const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
      }
    }
  }
`;

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '', // Manter como string para input type="date"
    familyCode: '', // Opcional
    fatherId: '', // Opcional
    motherId: '', // Opcional
  });
  const router = useRouter();

  const [register, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      if (data?.register?.token) {
        localStorage.setItem('authToken', data.register.token);
        console.log('Registration successful, token saved.');
        router.push('/profile'); // Redireciona após registro
        window.location.reload(); // Ou use estado global
      }
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting registration:', formData.email);

    // Prepara o input para a mutation, convertendo data se necessário
    // e removendo opcionais vazios para não enviar null explicitamente se não desejado
    const input = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null, // Envia como ISO string ou null
        // Não envia familyCode, fatherId, motherId se estiverem vazios
        familyCode: formData.familyCode || null,
        fatherId: formData.fatherId || null,
        motherId: formData.motherId || null,
    };

    // Remove explicitamente chaves com valor null se o backend não os espera ou trata '' como null
    // if (!input.familyCode) delete input.familyCode;
    // if (!input.fatherId) delete input.fatherId;
    // if (!input.motherId) delete input.motherId;


    try {
      await register({ variables: { input } });
    } catch (err) {
      console.error('An unexpected error occurred during registration:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
           <strong className="font-bold">Erro no Registro!</strong>
           <span className="block sm:inline"> {error.message}</span>
         </div>
       )}
      <Input
        label="Nome"
        id="firstName"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <Input
        label="Sobrenome"
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />
      <Input
        label="Senha"
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />
       <Input
        label="Data de Nascimento (Opcional)"
        id="birthDate"
        name="birthDate"
        type="date" // Input de data do navegador
        value={formData.birthDate}
        onChange={handleChange}
        // Não é 'required'
      />
      <Input
        label="Código da Família (Opcional)"
        id="familyCode"
        name="familyCode"
        value={formData.familyCode}
        onChange={handleChange}
        placeholder="Se já possui um código familiar"
      />
       {/* Inputs para IDs dos pais podem ser melhorados com busca/seleção */}
       <Input
        label="ID do Pai (Opcional)"
        id="fatherId"
        name="fatherId"
        value={formData.fatherId}
        onChange={handleChange}
        placeholder="ID do usuário pai, se já cadastrado"
      />
       <Input
        label="ID da Mãe (Opcional)"
        id="motherId"
        name="motherId"
        value={formData.motherId}
        onChange={handleChange}
        placeholder="ID da usuária mãe, se já cadastrada"
      />
      <div>
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={loading}
        >
          Registrar
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;