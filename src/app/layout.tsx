import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './../styles/globals.css'; // Ajuste o caminho se necessário
import ApolloProviderWrapper from '../components/providers/ApolloProviderWrapper';
// import AuthProvider from '../components/providers/AuthProvider'; // Opcional
import Navbar from '../components/navigation/Navbar'; // Crie este componente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Family Tree App',
  description: 'Track your family genealogy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Envolve a aplicação com os providers necessários */}
        <ApolloProviderWrapper>
          {/* <AuthProvider> */}
            <Navbar /> {/* Barra de navegação simples */}
            <main className="container mx-auto px-4 py-8">{children}</main>
          {/* </AuthProvider> */}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}