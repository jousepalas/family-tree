// src/app/(main)/add-member/page.tsx
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AddManualMemberInput, AddManualMemberSchema } from '@/lib/validations/profile'; // Use profile validation file
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { PlusCircle, UserPlus } from 'lucide-react';
import { gql } from '@apollo/client';

// GraphQL Mutation
const ADD_MANUAL_MEMBER_MUTATION = gql`
  mutation AddManualMember($input: AddManualMemberInput!) {
    addManualMember(input: $input) {
      id # Request ID to confirm success
      name
    }
  }
`;

export default function AddMemberPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [addManualMember, { error: mutationError }] = useMutation(ADD_MANUAL_MEMBER_MUTATION);

    const form = useForm<AddManualMemberInput>({
        resolver: zodResolver(AddManualMemberSchema),
        defaultValues: {
            name: '',
            gender: null,
            dateOfBirth: null,
            relationshipToAdder: undefined, // Explicitly undefined initially
        },
    });

    const onSubmit = async (data: AddManualMemberInput) => {
        setIsLoading(true);
        toast.loading('Adding family member...');

        try {
            const response = await addManualMember({
                variables: {
                    input: {
                        name: data.name,
                        gender: data.gender || undefined,
                        dateOfBirth: data.dateOfBirth,
                        relationshipToAdder: data.relationshipToAdder,
                    },
                },
                 // Optional: Refetch queries that might be affected, like a list of manual members
                 // refetchQueries: [{ query: GET_MY_MANUAL_MEMBERS_QUERY }],
            });

            toast.dismiss();

            if (response.data?.addManualMember) {
                console.log('Manual member added:', response.data.addManualMember);
                toast.success(`Successfully added ${response.data.addManualMember.name}.`);
                form.reset(); // Clear the form
                // Optional: Redirect to tree or dashboard
                // router.push('/tree');
            } else {
                 console.error("GraphQL Add Member Error:", response.errors);
                 toast.error(response.errors?.[0]?.message || 'Failed to add member.');
            }

        } catch (err: any) {
            toast.dismiss();
            console.error("Add Member Catch Error:", err);
             const graphQLError = err.graphQLErrors?.[0];
             if (graphQLError) {
                 toast.error(`Failed to add member: ${graphQLError.message}`);
             } else if (err.networkError) {
                 toast.error(`Network error: ${err.networkError.message}`);
             } else {
                 toast.error('An unexpected error occurred while adding the member.');
             }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto"> {/* Medium size card */}
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <UserPlus className="h-6 w-6" /> Add a Family Member Manually
                </CardTitle>
                <CardDescription>
                    Add individuals who aren't registered users yet (e.g., ancestors, young children).
                    You can link them to registered accounts later if they join.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="name" placeholder="Member's full name" disabled={isLoading} {...form.register('name')} />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="relationshipToAdder">Relationship to You <span className="text-red-500">*</span></Label>
                         <Controller
                            control={form.control}
                            name="relationshipToAdder"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={isLoading}>
                                    <SelectTrigger id="relationshipToAdder">
                                        <SelectValue placeholder="Select relationship..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARENT">Parent (Father/Mother)</SelectItem>
                                        <SelectItem value="CHILD">Child (Son/Daughter)</SelectItem>
                                        <SelectItem value="SPOUSE">Spouse (Husband/Wife)</SelectItem>
                                        <SelectItem value="SIBLING">Sibling (Brother/Sister)</SelectItem>
                                        {/* Add other relevant relationships: GRANDPARENT, AUNT_UNCLE, etc. */}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.relationshipToAdder && <p className="text-xs text-red-500">{form.formState.errors.relationshipToAdder.message}</p>}
                    </div>

                     {/* Column 2 */}
                     <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                         <Controller
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select birth date"
                                    disabled={isLoading}
                                />
                            )}
                        />
                        {form.formState.errors.dateOfBirth && <p className="text-xs text-red-500">{form.formState.errors.dateOfBirth.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="gender">Gender (Optional)</Label>
                         <Controller
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => field.onChange(value === "" ? null : value)}
                                    value={field.value ?? ""}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
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


                    {/* Submit Button spans both columns */}
                    <div className="md:col-span-2 mt-4">
                        <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </div>
                </form>
            </CardContent>
             <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    This member will be added to your tree. If they register later, you might be prompted to link their profile.
                 </p>
             </CardFooter>
        </Card>
    );
}