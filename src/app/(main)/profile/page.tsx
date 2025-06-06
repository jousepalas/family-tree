// src/app/(main)/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UpdateProfileInput, UpdateProfileSchema } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Assuming Switch component exists
import { DatePicker } from '@/components/ui/date-picker';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, UserCircle, Loader2 } from 'lucide-react';
import { gql } from '@apollo/client';
import { useSession } from 'next-auth/react'; // Import useSession to update session
import { formatDateForInput } from '@/lib/utils';

// GraphQL Queries and Mutations (or import from files/generated types)
const GET_CURRENT_USER_PROFILE = gql`
  query GetCurrentUserProfile {
    me {
      id
      name
      email
      image
      dateOfBirth
      gender
      fatherName
      motherName
      phoneNumber
      # countryCode # Assuming phone input handles this
      # country # Assuming phone input handles this
      isProfilePublic
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateUserProfileInput!) {
    updateProfile(input: $input) {
      id # Request ID to confirm success
      name image # Request fields needed to update session
      # Return other updated fields if needed elsewhere immediately
    }
  }
`;

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession(); // Get session and update function
    const [isLoading, setIsLoading] = useState(false);

    // Fetch current user data
    const { data: queryData, loading: queryLoading, error: queryError } = useQuery(GET_CURRENT_USER_PROFILE, {
        fetchPolicy: 'cache-and-network', // Ensure fresh data but show cache first
        skip: !session?.user, // Don't run query if user is not logged in
    });

    // Update profile mutation
    const [updateProfile, { loading: mutationLoading }] = useMutation(UPDATE_PROFILE_MUTATION);

    const form = useForm<UpdateProfileInput>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: { // Set default values initially, will be overridden by query data
            name: '',
            dateOfBirth: null,
            gender: null,
            fatherName: '',
            motherName: '',
            phoneNumber: '',
            isProfilePublic: false,
            image: '',
        },
    });

    // Populate form with fetched data once available
    useEffect(() => {
        if (queryData?.me) {
            const user = queryData.me;
            form.reset({
                name: user.name || '',
                // Ensure date is a Date object or null for the DatePicker
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
                gender: user.gender || null,
                fatherName: user.fatherName || '',
                motherName: user.motherName || '',
                phoneNumber: user.phoneNumber || '',
                isProfilePublic: user.isProfilePublic || false,
                image: user.image || '',
            });
        }
    }, [queryData, form]);

    const onSubmit = async (data: UpdateProfileInput) => {
        setIsLoading(true);
        toast.loading('Updating profile...');

        // Prepare only changed values to send
        const changedData: UpdateProfileInput = {};
        const originalData = queryData?.me;

        if (!originalData) {
            toast.error("Could not load original profile data.");
            setIsLoading(false);
            return;
        }

        (Object.keys(data) as Array<keyof UpdateProfileInput>).forEach(key => {
            // Special handling for date comparison
             if (key === 'dateOfBirth') {
                 const originalDateStr = originalData[key] ? formatDateForInput(originalData[key]) : null;
                 const newDateStr = data[key] ? formatDateForInput(data[key]) : null;
                 if (originalDateStr !== newDateStr) {
                    changedData[key] = data[key];
                 }
             } else if (data[key] !== originalData[key as keyof typeof originalData]) {
                 // Send null explicitly if a value is cleared
                 changedData[key] = data[key] === '' ? null : data[key];
             }
        });

        // Ensure nulls are handled correctly for optional fields
        if (changedData.fatherName === '') changedData.fatherName = null;
        if (changedData.motherName === '') changedData.motherName = null;
        if (changedData.phoneNumber === '') changedData.phoneNumber = null;
        if (changedData.image === '') changedData.image = null;
        if (changedData.gender === null && originalData.gender !== null) changedData.gender = null; // Handle clearing gender


        if (Object.keys(changedData).length === 0) {
            toast.dismiss();
            toast.success('No changes detected.');
            setIsLoading(false);
            return;
        }

        console.log("Submitting changes:", changedData);


        try {
            const response = await updateProfile({
                variables: { input: changedData },
                // Refetch profile query after mutation to update cache
                refetchQueries: [{ query: GET_CURRENT_USER_PROFILE }],
                awaitRefetchQueries: true, // Wait for refetch before proceeding
            });

            toast.dismiss();

            if (response.data?.updateProfile) {
                toast.success('Profile updated successfully!');
                // Update the NextAuth session with new name/image if changed
                await updateSession({
                    name: response.data.updateProfile.name,
                    image: response.data.updateProfile.image
                });
                // Optionally reset form to show updated values immediately if not relying solely on refetch
                // form.reset(response.data.updateProfile);
            } else {
                console.error("GraphQL Update Error:", response.errors);
                toast.error(response.errors?.[0]?.message || 'Failed to update profile.');
            }
        } catch (err: any) {
            toast.dismiss();
            console.error("Update Profile Catch Error:", err);
             const graphQLError = err.graphQLErrors?.[0];
             if (graphQLError) {
                 toast.error(`Update failed: ${graphQLError.message}`);
             } else if (err.networkError) {
                 toast.error(`Network error: ${err.networkError.message}`);
             } else {
                 toast.error('An unexpected error occurred while updating profile.');
             }
        } finally {
            setIsLoading(false);
        }
    };

     const getInitials = (name?: string | null) => {
         if (!name) return '?';
         const names = name.split(' ');
         if (names.length === 1) return names[0][0].toUpperCase();
         return (names[0][0] + names[names.length - 1][0]).toUpperCase();
     }

    if (queryLoading && !queryData) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading profile...</span>
            </div>
        );
    }

    if (queryError) {
        return <p className="text-red-500">Error loading profile: {queryError.message}</p>;
    }

     if (!queryData?.me) {
         return <p className="text-muted-foreground">Could not load profile data.</p>;
     }


    return (
        <Card className="w-full max-w-3xl mx-auto"> {/* Wider card for profile */}
            <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                     <Avatar className="h-16 w-16">
                        <AvatarImage src={form.watch('image') ?? undefined} alt={form.watch('name') ?? "User"} />
                        <AvatarFallback className="text-xl">{getInitials(form.watch('name'))}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <UserCircle className="h-6 w-6" /> Your Profile
                        </CardTitle>
                        <CardDescription>
                            Manage your personal information and privacy settings.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your full name" disabled={isLoading || mutationLoading} {...form.register('name')} />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={queryData?.me?.email || ''} disabled={true} // Email usually not editable directly
                         className="cursor-not-allowed bg-muted/50"
                        />
                         <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
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
                                    disabled={isLoading || mutationLoading}
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
                                <Select
                                    onValueChange={(value) => field.onChange(value === "" ? null : value)} // Handle empty selection as null
                                    value={field.value ?? ""} // Ensure value is string or "" for Select
                                    disabled={isLoading || mutationLoading}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="">Prefer not to say</SelectItem> {/* Explicit option for null */}
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.gender && <p className="text-xs text-red-500">{form.formState.errors.gender.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image">Profile Picture URL</Label>
                        <Input id="image" placeholder="https://example.com/image.png" disabled={isLoading || mutationLoading} {...form.register('image')} />
                        {form.formState.errors.image && <p className="text-xs text-red-500">{form.formState.errors.image.message}</p>}
                        {/* TODO: Add image upload functionality */}
                    </div>


                    {/* Column 2 */}
                    <div className="grid gap-2">
                        <Label htmlFor="fatherName">Father&apos;s Name</Label>
                        <Input id="fatherName" placeholder="Father's full name" disabled={isLoading || mutationLoading} {...form.register('fatherName')} />
                        {form.formState.errors.fatherName && <p className="text-xs text-red-500">{form.formState.errors.fatherName.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="motherName">Mother&apos;s Name</Label>
                        <Input id="motherName" placeholder="Mother's full name" disabled={isLoading || mutationLoading} {...form.register('motherName')} />
                        {form.formState.errors.motherName && <p className="text-xs text-red-500">{form.formState.errors.motherName.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                         <Controller
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <PhoneNumberInput
                                    id="phoneNumber"
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    placeholder="Enter phone number"
                                    disabled={isLoading || mutationLoading}
                                />
                            )}
                        />
                        {form.formState.errors.phoneNumber && <p className="text-xs text-red-500">{form.formState.errors.phoneNumber.message}</p>}
                    </div>
                     <div className="grid gap-2 items-center">
                         <Label htmlFor="isProfilePublic" className="flex items-center space-x-2">
                            <span>Profile Privacy</span>
                         </Label>
                         <div className="flex items-center space-x-2">
                             <Controller
                                control={form.control}
                                name="isProfilePublic"
                                render={({ field }) => (
                                    <Switch
                                        id="isProfilePublic"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading || mutationLoading}
                                    />
                                )}
                            />
                             <span className="text-sm text-muted-foreground">
                                {form.watch('isProfilePublic') ? 'Public (Visible to others)' : 'Private (Only visible to family)'}
                             </span>
                         </div>
                         {form.formState.errors.isProfilePublic && <p className="text-xs text-red-500">{form.formState.errors.isProfilePublic.message}</p>}
                     </div>

                    {/* Submit Button spans both columns */}
                    <div className="md:col-span-2 mt-4">
                        <Button type="submit" className="w-full" disabled={isLoading || mutationLoading || !form.formState.isDirty} isLoading={isLoading || mutationLoading}>
                           <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                         {!form.formState.isDirty && <p className="text-xs text-center mt-2 text-muted-foreground">No changes made.</p>}
                    </div>
                </form>
            </CardContent>
            {/* <CardFooter>
                {/* Optional: Add danger zone actions like delete account */}
            {/* </CardFooter> */}
        </Card>
    );
}