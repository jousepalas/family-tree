'use client'; // Essencial para hooks do Apollo Client

import { ApolloProvider } from '@apollo/client';
import { getApolloClient } from '../../lib/apolloClient'; // Crie esta função

export default function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  const client = getApolloClient(); // Obtém a instância do cliente

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}