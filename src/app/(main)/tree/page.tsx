// src/app/(main)/tree/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FamilyTree from "@/components/FamilyTree"; // Import the client component

export default async function TreePage() {
    const session = await getAuthSession();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // The FamilyTree component handles fetching and rendering on the client-side
    return (
        <section className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Your Family Tree
                </h1>
                <p className="text-muted-foreground mt-1">
                    Explore your connections. Click nodes for details or potential actions.
                </p>
             </div>
            {/* Render the client component, passing the starting user ID */}
            <FamilyTree startUserId={session.user.id} />
        </section>
    );
}