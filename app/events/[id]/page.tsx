import type { Metadata } from "next";
import { notFound } from "next/navigation";

import InvitationView from "@/components/event/InvitationView";
import { formatLongDate } from "@/lib/datetime";
import { fetchEventServer, fetchPublicAttendeesServer } from "@/lib/firestore-rest";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const event = await fetchEventServer(id, 60);

    if (!event) {
        return { title: "Invitation not found" };
    }

    const when = formatLongDate(event.date, event.timezone);
    const where = event.locationType === "online" ? "Online" : event.location || "";
    const description =
        event.description?.slice(0, 180) ||
        `${when}${where ? ` · ${where}` : ""}. Kindly reply.`;

    return {
        title: event.title,
        description,
        openGraph: {
            type: "website",
            title: event.title,
            description,
            siteName: "Invito",
        },
        twitter: {
            card: "summary_large_image",
            title: event.title,
            description,
        },
    };
}

export default async function PublicEventPage({ params }: PageProps) {
    const { id } = await params;
    const event = await fetchEventServer(id);

    if (!event) notFound();

    const attendees = event.guestListPublic
        ? await fetchPublicAttendeesServer(id)
        : [];

    return <InvitationView event={event} attendees={attendees} />;
}
