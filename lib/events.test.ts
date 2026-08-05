import { describe, expect, it } from "vitest";

import {
    headcount,
    isFull,
    isPast,
    normalizeEvent,
    normalizeGuest,
    seatsLeft,
    toIso,
} from "@/lib/events";

describe("toIso", () => {
    it("passes through an ISO string", () => {
        expect(toIso("2026-09-26T18:00:00.000Z")).toBe("2026-09-26T18:00:00.000Z");
    });

    it("converts a Date", () => {
        expect(toIso(new Date("2026-09-26T18:00:00Z"))).toBe(
            "2026-09-26T18:00:00.000Z"
        );
    });

    it("converts a Firestore Timestamp with toDate", () => {
        const stamp = { toDate: () => new Date("2026-09-26T18:00:00Z") };
        expect(toIso(stamp)).toBe("2026-09-26T18:00:00.000Z");
    });

    it("converts the raw {seconds} shape the REST API returns", () => {
        expect(toIso({ seconds: 1790445600 })).toBe("2026-09-26T18:00:00.000Z");
    });

    it("returns null for junk rather than an Invalid Date", () => {
        for (const value of [null, undefined, "", "not a date", {}, NaN]) {
            expect(toIso(value)).toBeNull();
        }
    });
});

describe("normalizeEvent", () => {
    it("fills in every field added after the redesign", () => {
        // A document exactly as the pre-redesign app wrote it.
        const legacy = {
            title: "My Birthday",
            hostName: "Adedeji",
            eventType: "social",
            date: "2026-01-20T15:00:00.000Z",
            location: "Osogbo, Osun",
            locationType: "physical",
            capacity: 10,
            attendees: 1,
            status: "active",
            creatorId: "user-1",
        };

        const event = normalizeEvent("evt1", legacy);

        expect(event).toMatchObject({
            id: "evt1",
            title: "My Birthday",
            status: "published",
            timezone: "UTC",
            allowPlusOnes: false,
            maxPlusOnes: 0,
            waitlistEnabled: false,
            guestListPublic: false,
            discussionEnabled: false,
            galleryEnabled: false,
            customQuestions: [],
        });
    });

    it("maps the legacy 'active' status onto 'published'", () => {
        expect(normalizeEvent("e", { status: "active" }).status).toBe("published");
        expect(normalizeEvent("e", { status: "draft" }).status).toBe("draft");
        expect(normalizeEvent("e", {}).status).toBe("published");
    });

    it("prefers endDateTime over the date-only endDate the old picker stored", () => {
        const event = normalizeEvent("e", {
            date: "2026-09-26T18:00:00.000Z",
            // The old form saved the picker's date at local midnight...
            endDate: "2026-09-26T00:00:00.000Z",
            // ...and the real end time separately.
            endDateTime: "2026-09-26T22:00:00.000Z",
        });

        expect(event.endDate).toBe("2026-09-26T22:00:00.000Z");
    });

    it("falls back to userId when creatorId is absent", () => {
        expect(normalizeEvent("e", { userId: "u9" }).creatorId).toBe("u9");
    });

    it("never returns a negative capacity or attendee count", () => {
        const event = normalizeEvent("e", { capacity: -5, attendees: -3 });
        expect(event.capacity).toBe(0);
        expect(event.attendees).toBe(0);
    });

    it("coerces numeric fields stored as strings", () => {
        const event = normalizeEvent("e", { capacity: "50", attendees: "7" });
        expect(event.capacity).toBe(50);
        expect(event.attendees).toBe(7);
    });

    it("drops malformed custom questions instead of rendering blanks", () => {
        const event = normalizeEvent("e", {
            customQuestions: [
                { id: "q1", label: "Dietary needs?", type: "short", required: true },
                { id: "q2", label: "   ", type: "short" },
                { label: "" },
                null,
                "nonsense",
            ],
        });

        expect(event.customQuestions).toHaveLength(1);
        expect(event.customQuestions[0]).toMatchObject({
            id: "q1",
            label: "Dietary needs?",
            required: true,
            options: [],
        });
    });

    it("defaults an unknown question type to a short answer", () => {
        const event = normalizeEvent("e", {
            customQuestions: [{ id: "q", label: "Song?", type: "wat" }],
        });
        expect(event.customQuestions[0].type).toBe("short");
    });

    it("turns empty strings into null for optional text", () => {
        const event = normalizeEvent("e", { description: "", imageUrl: "" });
        expect(event.description).toBeNull();
        expect(event.imageUrl).toBeNull();
    });

    it("survives a completely empty document", () => {
        const event = normalizeEvent("e", {});
        expect(event.title).toBe("Untitled event");
        expect(Number.isNaN(Date.parse(event.date))).toBe(false);
    });
});

describe("normalizeGuest", () => {
    it("reads plus-ones from the legacy 'guests' field", () => {
        const guest = normalizeGuest("g1", {
            name: "Ada",
            email: "ada@example.com",
            status: "attending",
            guests: 2,
        });

        expect(guest.plusOnes).toBe(2);
    });

    it("prefers the new plusOnes field when both are present", () => {
        const guest = normalizeGuest("g1", { plusOnes: 3, guests: 1 });
        expect(guest.plusOnes).toBe(3);
    });

    it("falls back to 'maybe' for an unrecognised status", () => {
        expect(normalizeGuest("g", { status: "banana" }).status).toBe("maybe");
        expect(normalizeGuest("g", {}).status).toBe("maybe");
    });

    it("keeps every valid status", () => {
        for (const status of [
            "attending",
            "not_attending",
            "maybe",
            "waitlisted",
        ] as const) {
            expect(normalizeGuest("g", { status }).status).toBe(status);
        }
    });

    it("coerces answers to a flat string map", () => {
        const guest = normalizeGuest("g", { answers: { q1: "Fish", q2: 42 } });
        expect(guest.answers).toEqual({ q1: "Fish", q2: "" });
    });
});

describe("capacity helpers", () => {
    it("counts a guest plus their plus-ones", () => {
        expect(headcount({ status: "attending", plusOnes: 2 })).toBe(3);
    });

    it("counts nobody for a decline, maybe or waitlist", () => {
        for (const status of ["not_attending", "maybe", "waitlisted"] as const) {
            expect(headcount({ status, plusOnes: 2 })).toBe(0);
        }
    });

    it("reports unlimited capacity as null seats left", () => {
        expect(seatsLeft({ capacity: 0, attendees: 100 })).toBeNull();
        expect(isFull({ capacity: 0, attendees: 100 })).toBe(false);
    });

    it("never reports negative seats left", () => {
        expect(seatsLeft({ capacity: 10, attendees: 14 })).toBe(0);
        expect(isFull({ capacity: 10, attendees: 14 })).toBe(true);
    });
});

describe("isPast", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();

    it("uses the end time when the event has one", () => {
        // Started yesterday, still running until tomorrow.
        expect(isPast({ date: past, endDate: future })).toBe(false);
    });

    it("falls back to the start time when there is no end", () => {
        expect(isPast({ date: past, endDate: null })).toBe(true);
        expect(isPast({ date: future, endDate: null })).toBe(false);
    });
});
