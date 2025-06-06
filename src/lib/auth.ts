// src/lib/auth.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions, getServerSession, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client'; // Import your Prisma User type

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error('Auth Error: Missing credentials');
          throw new Error('Please enter both email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Use a generic error message for security
        if (!user || !user.passwordHash) {
          console.error(`Auth Error: No user found for email ${credentials.email} or password not set.`);
          throw new Error('Invalid email or password.');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          console.error(`Auth Error: Invalid password for email ${credentials.email}.`);
          throw new Error('Invalid email or password.');
        }

        console.log('Authorization successful for:', user.email);
        // Return the user object required by NextAuth, MUST include id, email
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            // Add custom properties needed in session/token callbacks below
            // Example: role: user.role (if you add roles to your User model)
        };
      },
    }),
    // Add other providers like Google, Facebook etc. here if needed
    // GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
  ],
  session: {
    strategy: 'jwt', // Use JWT strategy, especially important with Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days session expiry
    updateAge: 24 * 60 * 60, // Update session expiry on activity every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in .env
  pages: {
    signIn: '/login', // Redirect users to /login if accessing protected pages
    error: '/login', // Redirect to login page on auth errors (e.g., invalid credentials)
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in
  },
  callbacks: {
    // Include user.id and other custom fields on the JWT token
    async jwt({ token, user, trigger, session }) {
      // The 'user' object is available on initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        // Add any other custom properties from the authorize function or adapter
        // token.role = user.role;
      }

      // Handle session updates (e.g., profile update)
      if (trigger === "update" && session?.name) {
          token.name = session.name;
      }
       if (trigger === "update" && session?.image) {
           token.picture = session.image;
       }

      // console.log("JWT Callback - Token:", token);
      return token;
    },
    // Include user.id and custom fields on the session object
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string; // Add user ID from token
        session.user.name = token.name; // Ensure name is synced from token
        session.user.email = token.email; // Ensure email is synced from token
        session.user.image = token.picture; // Ensure image is synced from token
        // Add any other custom properties from the token
        // session.user.role = token.role;
      }
      // console.log("Session Callback - Session:", session);
      return session;
    },
    async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        // Default redirect to dashboard after login/register
        return baseUrl + '/dashboard';
    }
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};

// Helper function to get session server-side (in Server Components, API Routes, etc.)
export const getAuthSession = () => getServerSession(authOptions);

// Extend the default NextAuth User type if you add custom properties in callbacks
declare module 'next-auth' {
  interface Session {
    user: NextAuthUser & {
      id: string;
      // Add other custom properties here if needed
      // role?: string;
    };
  }
   // Extend the default JWT token type
   interface JWT {
       id?: string;
       // Add other custom properties here if needed
       // role?: string;
   }
}