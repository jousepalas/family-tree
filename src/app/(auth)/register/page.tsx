// src/app/(auth)/register/page.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { RegisterInput, RegisterSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import PhoneNumberInput from '@/components/PhoneNumberInput'; // Import the wrapper
import { GitBranch, UserPlus } from 'lucide-react';
import { gql } from '@apollo/client'; // Or import from generated types/hooks
import { signIn } from 'next-auth/react'; // Import signIn for auto-login

// Define GraphQL Mutation (or import from separate file/generated types)
const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      email # Request fields needed for auto-login or confirmation
    }
  }
`;

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialInviteCode = searchParams.get('invite') || '';
    const [isLoading, setIsLoading] = useState(false);
    const [registerUser, { error: mutationError }] = useMutation(REGISTER_USER_MUTATION);

    const form = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            dateOfBirth: null,
            gender: null,
            fatherName: '',
            motherName: '',
            phoneNumber: '',
            inviteCode: initialInviteCode,
        },
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        toast.loading('Creating your account...'); // Show loading toast

        // Extract phone data if using a library that provides it separately
        // const phoneData = parsePhoneNumber(data.phoneNumber || '');
        // const countryCode = phoneData?.countryCallingCode;
        // const country = phoneData?.country;

        try {
            const response = await registerUser({
                variables: {
                    input: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        dateOfBirth: data.dateOfBirth,
                        gender: data.gender || undefined, // Send undefined if null
                        fatherName: data.fatherName || undefined,
                        motherName: data.motherName || undefined,
                        phoneNumber: data.phoneNumber || undefined,
                        // countryCode: countryCode, // Pass extracted data if available
                        // country: country,
                        inviteCode: data.inviteCode || undefined,
                    },
                },
            });

            toast.dismiss(); // Dismiss loading toast

            if (response.data?.registerUser) {
                console.log('Registration successful:', response.data.registerUser);
                toast.success('Account created successfully! Logging you in...');

                // Automatically log the user in after successful registration
                const signInResult = await signIn('credentials', {
                    redirect: false, // Handle redirect manually
                    email: data.email,
                    password: data.password,
                });

                if (signInResult?.ok) {
                    router.push('/dashboard'); // Redirect to dashboard
                    router.refresh(); // Refresh server data
                } else {
                    toast.error('Auto-login failed. Please log in manually.');
                    router.push('/login'); // Redirect to login page if auto-login fails
                }

            } else {
                 // Handle GraphQL errors specifically returned in the response
                 // This might be redundant if the errorLink in Apollo Client handles it
                 console.error("GraphQL Registration Error:", response.errors);
                 toast.error(response.errors?.[0]?.message || 'Registration failed. Please try again.');
            }

        } catch (err: any) {
            toast.dismiss(); // Dismiss loading toast
            console.error("Registration Catch Error:", err);
             // Handle network errors or errors thrown by Apollo Client/Mutation hook
             const graphQLError = err.graphQLErrors?.[0];
             if (graphQLError) {
                 toast.error(`Registration failed: ${graphQLError.message}`);
             } else if (err.networkError) {
                 toast.error(`Network error: ${err.networkError.message}`);
             } else {
                 toast.error('An unexpected error occurred during registration.');
             }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg"> {/* Increased max-width for more fields */}
            <CardHeader className="space-y-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                     <GitBranch className="h-8 w-8 text-primary" />
                 </div>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>
                    Join the family! Fill in the details below to get started.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1 */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="name" placeholder="Your full name" disabled={isLoading} {...form.register('name')} />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" disabled={isLoading} {...form.register('email')} />
                        {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                        <Input id="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" disabled={isLoading} {...form.register('password')} />
                        {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                        <Input id="confirmPassword" type="password" placeholder="Re-enter password" autoComplete="new-password" disabled={isLoading} {...form.register('confirmPassword')} />
                        {form.formState.errors.confirmPassword && <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                         <Controller
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select your birth date"
                                    disabled={isLoading}
                                />
                            )}
                        />
                        {form.formState.errors.dateOfBirth && <p className="text-xs text-red-500">{form.formState.errors.dateOfBirth.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                         <Controller
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""} disabled={isLoading}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                        <SelectItem value="PREFER_NOT_SAY">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.gender && <p className="text-xs text-red-500">{form.formState.errors.gender.message}</p>}
                    </div>

                    {/* Column 2 */}
                     <div className="grid gap-2">
                        <Label htmlFor="fatherName">Father&apos;s Name (Optional)</Label>
                        <Input id="fatherName" placeholder="Father's full name" disabled={isLoading} {...form.register('fatherName')} />
                        {form.formState.errors.fatherName && <p className="text-xs text-red-500">{form.formState.errors.fatherName.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="motherName">Mother&apos;s Name (Optional)</Label>
                        <Input id="motherName" placeholder="Mother's full name" disabled={isLoading} {...form.register('motherName')} />
                        {form.formState.errors.motherName && <p className="text-xs text-red-500">{form.formState.errors.motherName.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                         <Controller
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <PhoneNumberInput
                                    id="phoneNumber"
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    placeholder="Enter phone number"
                                    disabled={isLoading}
                                    defaultCountry="US" // Set your default country
                                />
                            )}
                        />
                        {form.formState.errors.phoneNumber && <p className="text-xs text-red-500">{form.formState.errors.phoneNumber.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inviteCode">Invite Code (Optional)</Label>
                        <Input id="inviteCode" placeholder="Enter invite code if you have one" disabled={isLoading} {...form.register('inviteCode')} />
                        {form.formState.errors.inviteCode && <p className="text-xs text-red-500">{form.formState.errors.inviteCode.message}</p>}
                    </div>

                    {/* Submit Button spans both columns */}
                    <div className="md:col-span-2 mt-4">
                        <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
                           <UserPlus className="mr-2 h-4 w-4" /> Create Account
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
                 <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                        Login here
                    </Link>
                </p>
                 <p className="mt-4 text-xs text-center text-muted-foreground">
                    By clicking Create Account, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
                    <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                 </p>
            </CardFooter>
        </Card>
    );
}