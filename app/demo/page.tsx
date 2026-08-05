import type { Metadata } from "next";
import Link from "next/link";

import InvitationView from "@/components/event/InvitationView";
import { Button } from "@/components/ui/button";
import { DEMO_ATTENDEES, demoEvent, demoMessages } from "@/lib/demo-event";

export const metadata: Metadata = {
    title: "A sample invitation",
    description:
        "See what a guest sees when you share an Invito link — plus-ones, custom questions, a waitlist and a note wall.",
};

// The sample event is dated relative to now so it never falls into the past.
export const dynamic = "force-dynamic";

export default function DemoPage() {
    return (
        <div className="bg-paper min-h-screen">
            <div className="border-rule bg-paper-sunken border-b">
                <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-ink-muted text-sm">
                        <span className="meta text-seal mr-2">Sample</span>
                        This is what your guests see. Replies here aren&rsquo;t saved.
                    </p>
                    <Button asChild size="sm" className="shrink-0">
                        <Link href="/auth/signup">Make your own</Link>
                    </Button>
                </div>
            </div>

            <InvitationView
                event={demoEvent()}
                attendees={DEMO_ATTENDEES}
                demo
                demoMessages={demoMessages()}
            />
        </div>
    );
}
