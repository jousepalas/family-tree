// src/app/(main)/invite/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Copy, Mail, Link as LinkIcon, Loader2, RefreshCw } from 'lucide-react';
import { gql } from '@apollo/client';

// GraphQL Mutation
const GENERATE_INVITE_CODE_MUTATION = gql`
  mutation GenerateInviteCode {
    generateInviteCode
  }
`;

export default function InvitePage() {
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [inviteLink, setInviteLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true); // Start loading initially

    const [generateCode, { loading: mutationLoading }] = useMutation(GENERATE_INVITE_CODE_MUTATION, {
        onCompleted: (data) => {
            const code = data?.generateInviteCode;
            if (code) {
                setInviteCode(code);
                // Construct the full invite link (ensure NEXTAUTH_URL is set correctly)
                const baseUrl = window.location.origin; // Use current origin
                setInviteLink(`${baseUrl}/register?invite=${code}`);
                toast.success('Invite code ready!');
            } else {
                 toast.error('Failed to retrieve invite code.');
            }
            setIsLoading(false);
        },
        onError: (error) => {
            console.error("Error generating invite code:", error);
            toast.error(`Failed to generate invite code: ${error.message}`);
            setIsLoading(false);
        }
    });

    // Fetch or generate the code when the component mounts
    useEffect(() => {
        generateCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const handleRegenerate = () => {
        setIsLoading(true);
        generateCode(); // Call the mutation again
    };

    const handleCopyCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode)
                .then(() => toast.success('Invite code copied!'))
                .catch(err => toast.error('Failed to copy code.'));
        }
    };

     const handleCopyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => toast.success('Invite link copied!'))
                .catch(err => toast.error('Failed to copy link.'));
        }
    };

    const handleShareEmail = () => {
         if (inviteLink) {
             const subject = encodeURIComponent("Join our family tree!");
             const body = encodeURIComponent(`Hi!\n\nYou're invited to join our family tree online. Click this link to register:\n\n${inviteLink}\n\nSee you there!`);
             window.location.href = `mailto:?subject=${subject}&body=${body}`;
         }
    };


    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Mail className="h-6 w-6" /> Invite Family Members
                </CardTitle>
                <CardDescription>
                    Share your unique invite code or link with family members so they can join your tree.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading || mutationLoading ? (
                     <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading invite code...</span>
                    </div>
                ) : inviteCode ? (
                    <>
                        {/* Invite Code Section */}
                        <div>
                            <Label htmlFor="inviteCode" className="text-base">Your Invite Code</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Input
                                    id="inviteCode"
                                    value={inviteCode}
                                    readOnly
                                    className="font-mono text-lg flex-1"
                                />
                                <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copy Code">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">Share this code directly with family members.</p>
                        </div>

                        {/* Invite Link Section */}
                         <div>
                            <Label htmlFor="inviteLink" className="text-base">Your Invite Link</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Input
                                    id="inviteLink"
                                    value={inviteLink}
                                    readOnly
                                    className="text-sm flex-1"
                                />
                                <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy Link">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleShareEmail} title="Share via Email">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">Share this link via email, message, etc.</p>
                        </div>
                    </>
                ) : (
                     <p className="text-center text-red-500">Could not load invite code. Please try again.</p>
                )}

            </CardContent>
             <CardFooter className="flex justify-end border-t pt-4">
                 <Button variant="ghost" onClick={handleRegenerate} disabled={isLoading || mutationLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || mutationLoading ? 'animate-spin' : ''}`} />
                    Regenerate Code
                 </Button>
             </CardFooter>
        </Card>
    );
}