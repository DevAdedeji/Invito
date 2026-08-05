import type { InvitoEvent, RsvpStatus } from "@/lib/types";

/**
 * The RSVP decision, separated from Firestore so the capacity and waitlist
 * rules can be reasoned about (and tested) without a database.
 */

export type RsvpChoice = Exclude<RsvpStatus, "waitlisted">;

export type EventCapacityFields = Pick<
    InvitoEvent,
    "capacity" | "attendees" | "allowPlusOnes" | "maxPlusOnes" | "waitlistEnabled"
>;

export interface PreviousReply {
    status: RsvpStatus;
    plusOnes: number;
}

export interface RsvpDecisionInput {
    event: EventCapacityFields;
    choice: RsvpChoice;
    plusOnes: number;
    previous: PreviousReply | null;
}

export type RsvpDecision =
    | {
        kind: "accepted";
        status: RsvpStatus;
        plusOnes: number;
        heads: number;
        previousHeads: number;
        attendeeDelta: number;
        nextAttendees: number;
    }
    | { kind: "full"; seatsAvailable: number };

/** Heads a reply accounts for, counting the guest themselves. */
export function headsFor(status: RsvpStatus, plusOnes: number): number {
    return status === "attending" ? 1 + plusOnes : 0;
}

export function resolveRsvp(input: RsvpDecisionInput): RsvpDecision {
    const { event, choice, previous } = input;

    const plusOnes = event.allowPlusOnes
        ? Math.min(Math.max(0, Math.trunc(input.plusOnes)), event.maxPlusOnes)
        : 0;

    const previousHeads = previous
        ? headsFor(previous.status, previous.plusOnes)
        : 0;

    let status: RsvpStatus = choice;
    let heads = headsFor(status, plusOnes);

    if (status === "attending" && event.capacity > 0) {
        // Discount this guest's own previous booking so amending a reply is not
        // measured against the seats they already hold.
        const takenByOthers = Math.max(0, event.attendees - previousHeads);
        const available = event.capacity - takenByOthers;

        if (heads > available) {
            if (!event.waitlistEnabled) {
                return { kind: "full", seatsAvailable: Math.max(0, available) };
            }
            status = "waitlisted";
            heads = 0;
        }
    }

    // The security rules cap how far a single public write may move the
    // counter, so keep the delta inside the same bound the rules enforce.
    const ceiling = 1 + event.maxPlusOnes;
    const attendeeDelta = Math.max(
        -ceiling,
        Math.min(ceiling, heads - previousHeads)
    );

    return {
        kind: "accepted",
        status,
        plusOnes,
        heads,
        previousHeads,
        attendeeDelta,
        nextAttendees: Math.max(0, event.attendees + attendeeDelta),
    };
}
