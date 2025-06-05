// src/app/privacy/page.tsx
// Placeholder for Privacy Policy Page
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
    return (
        <section className="py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

                    <h2>1. Introduction</h2>
                    <p>Welcome to FamilyTree App. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>

                    <h2>2. Information We Collect</h2>
                    <p>We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application or otherwise when you contact us.</p>
                    <p>The personal information that we collect depends on the context of your interactions with us and the application, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
                    <ul>
                        <li>Personal Information Provided by You: Name, email address, password, date of birth, gender, family relationship information (including names and details of relatives you add), phone number, profile picture, etc.</li>
                        <li>Information automatically collected: We may automatically collect certain information when you visit, use or navigate the application (e.g., IP address, browser type, operating system, usage data).</li>
                    </ul>

                    <h2>3. How We Use Your Information</h2>
                    <p>We use personal information collected via our application for a variety of business purposes described below...</p>
                    {/* Add details on usage: providing service, communication, security, analytics, etc. */}

                    <h2>4. Will Your Information Be Shared With Anyone?</h2>
                    <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations...</p>
                     {/* Detail sharing practices: e.g., with service providers, for legal reasons, etc. Specify NO selling of data. */}

                    <h2>5. How Long Do We Keep Your Information?</h2>
                    <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law...</p>

                     <h2>6. How Do We Keep Your Information Safe?</h2>
                    <p>We aim to protect your personal information through a system of organizational and technical security measures...</p>

                    <h2>7. What Are Your Privacy Rights?</h2>
                    <p>You may review, change, or terminate your account at any time...</p>
                    {/* Detail user rights: access, correction, deletion, etc. */}

                    <h2>8. Updates To This Notice</h2>
                    <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last Updated" date...</p>

                    <h2>9. How Can You Contact Us About This Notice?</h2>
                    <p>If you have questions or comments about this notice, you may email us at [Your Contact Email] or by post to:</p>
                    <p>[Your Company Name/Address, if applicable]</p>

                    {/* Add more sections as legally required/appropriate for your app */}
                </CardContent>
            </Card>
        </section>
    );
}