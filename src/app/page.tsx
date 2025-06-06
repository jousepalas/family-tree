// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, GitBranch, Share2, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            {/* Left Column: Text Content */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Discover Your Family Story
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Build your interactive family tree, connect with relatives,
                  and preserve your heritage for generations to come. Simple, secure, and collaborative.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto">Get Started Free</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">Login</Button>
                </Link>
              </div>
            </div>
            {/* Right Column: Visual (Placeholder) */}
            <div className="flex items-center justify-center">
                {/* Replace with an actual image or illustration */}
                 <GitBranch className="h-48 w-48 lg:h-64 lg:w-64 xl:h-80 xl:w-80 text-primary/30" strokeWidth={1}/>
            </div>
          </div>
        </div>
      </section>

       {/* Features Section */}
       <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
         <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
             <div className="space-y-2">
               <div className="inline-block rounded-lg bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground dark:text-secondary">Key Features</div>
               <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose FamilyTree App?</h2>
               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                 Everything you need to explore your roots and connect with your family history in one place.
               </p>
             </div>
           </div>
           <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
             <Card className="hover:shadow-lg transition-shadow duration-300">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/> Interactive Tree</CardTitle>
                 <CardDescription>Visually build and explore your family connections with an easy-to-use interface.</CardDescription>
               </CardHeader>
               <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500"/> Add registered & manual members
               </CardContent>
             </Card>
             <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Share2 className="h-6 w-6 text-primary"/> Collaboration</CardTitle>
                 <CardDescription>Invite family members to view and contribute to your shared family history.</CardDescription>
               </CardHeader>
               <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500"/> Secure invite system
               </CardContent>
             </Card>
             <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                 <CardTitle className="flex items-center gap-2"><CheckCircle className="h-6 w-6 text-primary"/> Privacy Control</CardTitle>
                 <CardDescription>You decide who sees your profile and family information.</CardDescription>
               </CardHeader>
               <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500"/> Public/private profile options
               </CardContent>
             </Card>
           </div>
         </div>
       </section>
    </>
  );
}