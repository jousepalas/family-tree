// src/app/terms/page.tsx
// Placeholder for Terms of Service Page
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
    return (
        <section className="py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

                    <h2>1. Agreement to Terms</h2>
                    <p>By using our FamilyTree App application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you do not have permission to access the Service.</p>

                    <h2>2. Accounts</h2>
                    <p>When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service...</p>
                     <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password...</p>

                    <h2>3. User Content</h2>
                    <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
                    <p>By posting Content on or through the Service, You represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity...</p>
                    <p>You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third party posts on or through the Service...</p>

                     <h2>4. Prohibited Uses</h2>
                    <p>You may use the Service only for lawful purposes and in accordance with Terms. You agree not to use the Service:</p>
                    <ul>
                        <li>In any way that violates any applicable national or international law or regulation.</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                        <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
                        {/* Add more prohibited actions */}
                    </ul>

                    <h2>5. Intellectual Property</h2>
                    <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of [Your Company Name] and its licensors...</p>

                    <h2>6. Termination</h2>
                    <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms...</p>

                    <h2>7. Disclaimer of Warranties; Limitation of Liability</h2>
                    <p>The service is provided on an "AS IS" and "AS AVAILABLE" basis... [Include standard disclaimers and limitations of liability - consult legal advice].</p>

                    <h2>8. Governing Law</h2>
                    <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

                    <h2>9. Changes to Terms</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time...</p>

                    <h2>10. Contact Us</h2>
                     <p>If you have any questions about these Terms, please contact us at [Your Contact Email].</p>

                    {/* Add more sections as legally required/appropriate for your app */}
                </CardContent>
            </Card>
        </section>
    );
}
