// src/server/graphql/context.ts
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Session } from 'next-auth'; // Import Session type from next-auth

// Define the structure of your context
export interface Context {
  prisma: PrismaClient;
  // Use the extended Session type which includes the user ID
  currentUser: Session['user'] | null;
}

// Context factory function
export async function createContext(
    // These types might differ slightly depending on the integration (@as-integrations/next)
    // and whether you're using Edge runtime or Node.js runtime.
    // For standard Node.js API routes with `@as-integrations/next`:
    req: any, // Can be NextApiRequest or NextRequest depending on setup
    res: any, // Can be NextApiResponse or NextResponse
): Promise<Context> {
  const session = await getAuthSession(); // Fetches session based on request cookies/headers

  // console.log("Session in GraphQL context:", session);

  return {
    prisma,
    currentUser: session ? session.user : null, // Pass the user object from the session
  };
}