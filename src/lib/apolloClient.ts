// Use 'use client' or keep it server-side, depending on where you initialize
// For simplicity here, assuming it could be used client-side initially.

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Link HTTP para a API GraphQL
const httpLink = createHttpLink({
  // Usa URL relativa para funcionar em dev e prod
  uri: '/api/graphql',
  // fetchOptions: { cache: 'no-store' }, // Desabilita cache do fetch se necessário
});

// Link para adicionar o token de autenticação aos headers
const authLink = setContext((_, { headers }) => {
  // Pega o token do localStorage (ou de onde você o armazenar)
  // Certifique-se que este código só rode no cliente
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Retorna os headers para o contexto para que httpLink possa lê-los
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Adiciona o header Authorization
    }
  };
});

// Instância singleton do Apollo Client
let client: ApolloClient<any> | null = null;

export const getApolloClient = () => {
  // Cria a instância se ainda não existir (importante para SSR/Next.js)
  if (!client || typeof window === 'undefined') {
    client = new ApolloClient({
      // Combina o authLink e o httpLink
      link: from([authLink, httpLink]),
      cache: new InMemoryCache(),
      // Habilitar SSR se necessário (configuração mais complexa)
      ssrMode: typeof window === 'undefined',
    });
  }
  return client;
};

// Função para resetar o store do Apollo ao fazer logout, por exemplo
export const resetApolloClient = () => {
    const clientInstance = getApolloClient();
    if (clientInstance) {
        clientInstance.resetStore();
    }
}