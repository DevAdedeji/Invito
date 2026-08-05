import { buildIcs } from "@/lib/datetime";
import { fetchEventServer } from "@/lib/firestore-rest";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const event = await fetchEventServer(id, 60);

    if (!event) {
        return new Response("Event not found", { status: 404 });
    }

    const origin = new URL(request.url).origin;

    const ics = buildIcs({
        uid: event.id,
        title: event.title,
        description: event.description ?? `You're invited to ${event.title}.`,
        location: event.location,
        url: `${origin}/events/${event.id}`,
        startIso: event.date,
        endIso: event.endDate,
        organizer: event.hostName || "Invito",
    });

    const filename = event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50) || "invitation";

    return new Response(ics, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}.ics"`,
            "Cache-Control": "public, max-age=0, s-maxage=60",
        },
    });
}
