// src/app/(main)/layout.tsx
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Layout for the main application sections (Dashboard, Profile, Tree, etc.)
// This layout enforces authentication.
export default async function MainAppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getAuthSession();

    // If no session, redirect to login page
    if (!session?.user) {
        // Construct callback URL to redirect back after login
        // Note: This might require reading the current path, which can be tricky in server layouts.
        // A simpler approach is to always redirect to dashboard after login via NextAuth config.
        // const callbackUrl = encodeURIComponent(currentPath); // Need a way to get currentPath
        redirect(`/login`); // Redirect to login, NextAuth config handles post-login redirect
    }

    // User is authenticated, render the children within this layout
    return (
         <>
            {/* You could add a sidebar or secondary navigation specific to the main app here */}
            {/* <aside>...</aside> */}
            {children}
         </>
    );
}