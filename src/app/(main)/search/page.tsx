// src/app/(main)/search/page.tsx
'use client';

import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, UserPlus, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link'; // For linking to profiles if needed

// GraphQL Query
const SEARCH_USERS_QUERY = gql`
  query SearchUsers($term: String!) {
    searchUsers(term: $term) {
      id
      name
      email # Consider privacy implications
      image
      type # 'USER' or 'MANUAL'
    }
  }
`;

// Define the shape of a search result item
interface SearchResultItem {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
    type: 'USER' | 'MANUAL'; // Assuming backend returns this
}

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [executeSearch, { loading, error, data }] = useLazyQuery<{ searchUsers: SearchResultItem[] }>(SEARCH_USERS_QUERY);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (searchTerm.trim().length >= 2) {
            executeSearch({ variables: { term: searchTerm.trim() } });
        } else {
            // Optionally show a message asking for a longer search term
        }
    };

     const getInitials = (name?: string | null) => {
         if (!name) return '?';
         const names = name.split(' ');
         if (names.length === 1) return names[0][0].toUpperCase();
         return (names[0][0] + names[names.length - 1][0]).toUpperCase();
     }

    const results: SearchResultItem[] = data?.searchUsers || [];

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Search Family Members
                </h1>
                <p className="text-muted-foreground mt-1">
                    Find registered users or manually added members. Results may depend on privacy settings.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                    type="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                    aria-label="Search term"
                />
                <Button type="submit" disabled={loading || searchTerm.trim().length < 2}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                </Button>
            </form>

            {/* Results Area */}
            <div className="mt-6">
                {loading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Searching...</span>
                    </div>
                )}
                {error && <p className="text-red-500 text-center">Error searching: {error.message}</p>}

                {!loading && !error && results.length === 0 && searchTerm.trim().length >= 2 && (
                     <p className="text-muted-foreground text-center py-10">No results found for "{searchTerm}".</p>
                )}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((result) => (
                            <Card key={result.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={result.image ?? undefined} alt={result.name} />
                                        <AvatarFallback>{getInitials(result.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-lg truncate">{result.name}</CardTitle>
                                        {result.type === 'USER' && result.email && <CardDescription className="truncate">{result.email}</CardDescription>}
                                        {result.type === 'MANUAL' && <CardDescription className="italic">Manual Entry</CardDescription>}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {/* Add more details if available/needed */}
                                </CardContent>
                                <div className="border-t p-4 flex justify-end gap-2">
                                     {result.type === 'USER' && (
                                         <Button variant="outline" size="sm" asChild>
                                             {/* TODO: Link to user profile page if implemented */}
                                             <Link href={`/profile/${result.id}`}>View Profile</Link>
                                         </Button>
                                     )}
                                    {/* TODO: Add "Connect" or "Add Relationship" button */}
                                    {/* <Button size="sm">
                                        <UserPlus className="mr-2 h-4 w-4" /> Connect
                                    </Button> */}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}