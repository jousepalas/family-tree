// src/app/(auth)/layout.tsx
import React from 'react';

// Layout specifically for authentication pages (Login, Register)
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            {/* Centered container for auth forms */}
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}