import { describe, expect, it } from "vitest";

import { resolveRsvp, type EventCapacityFields } from "@/lib/rsvp-policy";

function event(overrides: Partial<EventCapacityFields> = {}): EventCapacityFields {
    return {
        capacity: 0,
        attendees: 0,
        allowPlusOnes: false,
        maxPlusOnes: 0,
        waitlistEnabled: false,
        ...overrides,
    };
}

describe("resolveRsvp", () => {
    it("counts a plain acceptance as one head", () => {
        const decision = resolveRsvp({
            event: event(),
            choice: "attending",
            plusOnes: 0,
            previous: null,
        });

        expect(decision).toMatchObject({
            kind: "accepted",
            status: "attending",
            heads: 1,
            attendeeDelta: 1,
            nextAttendees: 1,
        });
    });

    it("does not count declines or maybes toward the headcount", () => {
        for (const choice of ["not_attending", "maybe"] as const) {
            const decision = resolveRsvp({
                event: event({ attendees: 5 }),
                choice,
                plusOnes: 0,
                previous: null,
            });

            expect(decision).toMatchObject({
                kind: "accepted",
                heads: 0,
                attendeeDelta: 0,
                nextAttendees: 5,
            });
        }
    });

    it("ignores plus-ones when the host has not enabled them", () => {
        const decision = resolveRsvp({
            event: event({ allowPlusOnes: false, maxPlusOnes: 0 }),
            choice: "attending",
            plusOnes: 3,
            previous: null,
        });

        expect(decision).toMatchObject({ plusOnes: 0, heads: 1 });
    });

    it("clamps plus-ones to the host's maximum", () => {
        const decision = resolveRsvp({
            event: event({ allowPlusOnes: true, maxPlusOnes: 2 }),
            choice: "attending",
            plusOnes: 9,
            previous: null,
        });

        expect(decision).toMatchObject({ plusOnes: 2, heads: 3, attendeeDelta: 3 });
    });

    it("treats capacity 0 as unlimited", () => {
        const decision = resolveRsvp({
            event: event({ capacity: 0, attendees: 9999 }),
            choice: "attending",
            plusOnes: 0,
            previous: null,
        });

        expect(decision.kind).toBe("accepted");
    });

    describe("at capacity", () => {
        it("rejects when there is no waitlist, reporting the seats left", () => {
            const decision = resolveRsvp({
                event: event({ capacity: 10, attendees: 10 }),
                choice: "attending",
                plusOnes: 0,
                previous: null,
            });

            expect(decision).toEqual({ kind: "full", seatsAvailable: 0 });
        });

        it("rejects a group that does not fit even when seats remain", () => {
            const decision = resolveRsvp({
                event: event({
                    capacity: 10,
                    attendees: 9,
                    allowPlusOnes: true,
                    maxPlusOnes: 3,
                }),
                choice: "attending",
                plusOnes: 3,
                previous: null,
            });

            // Party of four, one seat left.
            expect(decision).toEqual({ kind: "full", seatsAvailable: 1 });
        });

        it("accepts a group that exactly fills the remaining seats", () => {
            const decision = resolveRsvp({
                event: event({
                    capacity: 10,
                    attendees: 8,
                    allowPlusOnes: true,
                    maxPlusOnes: 3,
                }),
                choice: "attending",
                plusOnes: 1,
                previous: null,
            });

            expect(decision).toMatchObject({ kind: "accepted", nextAttendees: 10 });
        });

        it("waitlists instead of rejecting when the waitlist is on", () => {
            const decision = resolveRsvp({
                event: event({ capacity: 10, attendees: 10, waitlistEnabled: true }),
                choice: "attending",
                plusOnes: 0,
                previous: null,
            });

            expect(decision).toMatchObject({
                kind: "accepted",
                status: "waitlisted",
                heads: 0,
                attendeeDelta: 0,
                nextAttendees: 10,
            });
        });
    });

    describe("amending an existing reply", () => {
        it("frees the guest's seats when they switch to a decline", () => {
            const decision = resolveRsvp({
                event: event({
                    capacity: 10,
                    attendees: 4,
                    allowPlusOnes: true,
                    maxPlusOnes: 3,
                }),
                choice: "not_attending",
                plusOnes: 0,
                previous: { status: "attending", plusOnes: 2 },
            });

            expect(decision).toMatchObject({
                previousHeads: 3,
                attendeeDelta: -3,
                nextAttendees: 1,
            });
        });

        it("does not double-count a guest who only changes their plus-ones", () => {
            const decision = resolveRsvp({
                event: event({
                    capacity: 10,
                    attendees: 3,
                    allowPlusOnes: true,
                    maxPlusOnes: 3,
                }),
                choice: "attending",
                plusOnes: 2,
                previous: { status: "attending", plusOnes: 0 },
            });

            expect(decision).toMatchObject({ attendeeDelta: 2, nextAttendees: 5 });
        });

        it("lets a sold-out event's existing guest keep their seat", () => {
            // The event is full, but these are the seats this guest already holds.
            const decision = resolveRsvp({
                event: event({ capacity: 10, attendees: 10 }),
                choice: "attending",
                plusOnes: 0,
                previous: { status: "attending", plusOnes: 0 },
            });

            expect(decision).toMatchObject({
                kind: "accepted",
                attendeeDelta: 0,
                nextAttendees: 10,
            });
        });

        it("keeps the counter within the bound the security rules enforce", () => {
            // A host who lowers maxPlusOnes after a large reply must not produce a
            // delta the rules would reject outright.
            const decision = resolveRsvp({
                event: event({
                    capacity: 0,
                    attendees: 20,
                    allowPlusOnes: true,
                    maxPlusOnes: 1,
                }),
                choice: "not_attending",
                plusOnes: 0,
                previous: { status: "attending", plusOnes: 9 },
            });

            expect(decision).toMatchObject({ attendeeDelta: -2 });
        });
    });

    it("never drives the counter below zero", () => {
        const decision = resolveRsvp({
            event: event({ attendees: 0 }),
            choice: "not_attending",
            plusOnes: 0,
            previous: { status: "attending", plusOnes: 0 },
        });

        expect(decision).toMatchObject({ nextAttendees: 0 });
    });
});
