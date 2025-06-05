// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { resolvers } from '@/server/graphql/resolvers';
import { typeDefs } from '@/server/graphql/typeDefs';
import { createContext, Context } from '@/server/graphql/context';
import { NextRequest } from 'next/server';

// Explicitly type the server using the Context interface
const server = new ApolloServer<Context>({
  resolvers,
  typeDefs,
  introspection: process.env.NODE_ENV !== 'production', // Disable introspection in production for security
  // You can add plugins here if needed (e.g., for logging, error handling, persisted queries)
  // plugins: [ApolloServerPluginLandingPageDisabled()] // Disable landing page in production
});

// Create the handler using the App Router integration
// Pass the context function directly
const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
    // The context function is expected to take the request object
    context: async (req) => createContext(req, null), // Response object might not be needed depending on context logic
});


// Export the handler for GET and POST requests as required by Next.js App Router API routes
export { handler as GET, handler as POST };