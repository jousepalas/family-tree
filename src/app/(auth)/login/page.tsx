// src/app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LoginInput, LoginSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, LogIn } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const error = searchParams.get('error');
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Display initial error from NextAuth redirect
    React.useEffect(() => {
        if (error) {
            // Map NextAuth error codes to user-friendly messages
            let errorMessage = 'An unknown error occurred during login.';
            if (error === 'CredentialsSignin') {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (error === 'Callback') {
                errorMessage = 'There was an issue processing your login. Please try again.';
            }
            // Add more specific error mappings if needed
            toast.error(errorMessage);
            // Clear the error from the URL? Optional.
            // router.replace('/login', undefined);
        }
    }, [error, router]);


    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false, // Handle redirect manually based on result
                email: data.email,
                password: data.password,
                // callbackUrl: callbackUrl, // Let NextAuth handle redirect on success if redirect:true
            });

            if (result?.error) {
                console.error("Sign In Error:", result.error);
                // Error is already handled by the useEffect hook listening to searchParams
                // Or display a specific toast here if needed
                let errorMessage = 'Invalid email or password.';
                 if (result.error !== 'CredentialsSignin') {
                    errorMessage = 'Login failed. Please try again later.'; // Generic for other errors
                 }
                toast.error(errorMessage);

            } else if (result?.ok) {
                toast.success('Login successful! Redirecting...');
                router.push(callbackUrl); // Redirect to dashboard or intended page
                 router.refresh(); // Refresh server components
            } else {
                 toast.error('Login failed. Please try again.');
            }

        } catch (err) {
            console.error("Login Page Catch Error:", err);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                     <GitBranch className="h-8 w-8 text-primary" />
                 </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                    Enter your email and password to access your family tree.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            autoComplete="email"
                            disabled={isLoading}
                            {...form.register('email')}
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            autoComplete="current-password"
                            disabled={isLoading}
                            {...form.register('password')}
                        />
                         {form.formState.errors.password && (
                            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    {/* Optional: Add "Forgot Password?" link here */}
                    {/* <div className="text-right text-sm">
                        <Link href="/forgot-password" className="underline text-muted-foreground hover:text-primary">
                            Forgot password?
                        </Link>
                    </div> */}
                    <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                </form>
                {/* Optional: Add social login buttons here */}
                {/* <div className="relative mt-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                    <Button variant="outline" onClick={() => signIn('google')} disabled={isLoading}>
                        Continue with Google
                    </Button>
                </div> */}
            </CardContent>
             <CardFooter className="flex flex-col items-center text-sm">
                <p className="text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                        Register here
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}