// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path if necessary

// The handler will automatically handle routes like /api/auth/session, /api/auth/signin, etc.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };