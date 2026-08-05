import type { DiscussionMessage, InvitoEvent, PublicAttendee } from "@/lib/types";

export const DEMO_EVENT_ID = "demo";

/** Keeps the sample invitation permanently in the future. */
function upcomingSaturdayEvening(): { start: Date; end: Date } {
    const start = new Date();
    start.setDate(start.getDate() + 24);
    // Roll forward to the next Saturday.
    start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7));
    start.setHours(19, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 0, 0, 0);

    return { start, end };
}

export function demoEvent(): InvitoEvent {
    const { start, end } = upcomingSaturdayEvening();

    return {
        id: DEMO_EVENT_ID,
        title: "Supper on the Terrace",
        hostName: "Ada Obi",
        eventType: "dinner",
        description:
            "Long table, low light, and the good plates. We'll eat at eight and carry on until the neighbours complain.\n\nCome hungry, and bring a record if you have one you want to hear.",
        imageUrl: null,

        date: start.toISOString(),
        endDate: end.toISOString(),
        timezone: "Africa/Lagos",

        location: "12 Marina, Lagos",
        locationType: "physical",

        capacity: 24,
        attendees: DEMO_ATTENDEES.reduce((sum, a) => sum + 1 + a.plusOnes, 0),

        allowPlusOnes: true,
        maxPlusOnes: 2,
        waitlistEnabled: true,
        guestListPublic: true,
        discussionEnabled: true,
        galleryEnabled: false,
        customQuestions: [
            {
                id: "meal",
                label: "Anything you don't eat?",
                type: "choice",
                required: true,
                options: ["No restrictions", "Vegetarian", "Vegan", "Pescatarian"],
            },
            {
                id: "record",
                label: "A record you'd like played",
                type: "short",
                required: false,
                options: [],
            },
        ],

        creatorId: "demo-host",
        status: "published",
        createdAt: null,
    };
}

export const DEMO_ATTENDEES: PublicAttendee[] = [
    { id: "1", firstName: "Chidi", plusOnes: 1, rsvpDate: "2026-08-01T09:00:00.000Z" },
    { id: "2", firstName: "Bola", plusOnes: 0, rsvpDate: "2026-08-01T11:00:00.000Z" },
    { id: "3", firstName: "Ngozi", plusOnes: 2, rsvpDate: "2026-08-02T08:30:00.000Z" },
    { id: "4", firstName: "Tunde", plusOnes: 0, rsvpDate: "2026-08-02T14:00:00.000Z" },
    { id: "5", firstName: "Amara", plusOnes: 1, rsvpDate: "2026-08-03T10:15:00.000Z" },
    { id: "6", firstName: "Kemi", plusOnes: 0, rsvpDate: "2026-08-03T18:40:00.000Z" },
    { id: "7", firstName: "Sade", plusOnes: 1, rsvpDate: "2026-08-04T07:20:00.000Z" },
    { id: "8", firstName: "Emeka", plusOnes: 0, rsvpDate: "2026-08-04T19:05:00.000Z" },
];

export function demoMessages(): DiscussionMessage[] {
    const hoursAgo = (h: number) =>
        new Date(Date.now() - h * 3_600_000).toISOString();

    return [
        {
            id: "m1",
            authorName: "Ada Obi",
            body: "Parking is easiest on the street behind the building — the gate on Marina gets blocked after seven.",
            createdAt: hoursAgo(52),
            isHost: true,
        },
        {
            id: "m2",
            authorName: "Chidi",
            body: "Bringing a bottle of something red. See everyone Saturday.",
            createdAt: hoursAgo(19),
            isHost: false,
        },
        {
            id: "m3",
            authorName: "Ngozi",
            body: "Can I steal the recipe for the thing you made last time?",
            createdAt: hoursAgo(4),
            isHost: false,
        },
    ];
}
