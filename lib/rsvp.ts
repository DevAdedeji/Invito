import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { normalizeEvent, normalizeGuest } from "@/lib/events";
import { guestDocId } from "@/lib/guest-id";
import { resolveRsvp, type RsvpChoice } from "@/lib/rsvp-policy";
import type { InvitoEvent, RsvpStatus } from "@/lib/types";

export class EventFullError extends Error {
    constructor(public seatsLeft: number) {
        super("This event is full.");
        this.name = "EventFullError";
    }
}

export interface RsvpInput {
    eventId: string;
    name: string;
    email: string;
    status: RsvpChoice;
    plusOnes: number;
    note: string;
    answers: Record<string, string>;
}

export interface RsvpResult {
    status: RsvpStatus;
    isUpdate: boolean;
    plusOnes: number;
}

/**
 * Writes an RSVP, enforcing capacity and falling back to the waitlist.
 *
 * Reads the event immediately before writing rather than trusting the copy the
 * page was rendered with, so a stale count cannot oversell the last seat.
 */
export async function submitRsvp(input: RsvpInput): Promise<RsvpResult> {
    const guestId = await guestDocId(input.email);
    const guestRef = doc(db, "events", input.eventId, "guests", guestId);
    const publicRef = doc(db, "events", input.eventId, "attendees_public", guestId);
    const eventRef = doc(db, "events", input.eventId);

    const [eventSnapshot, guestSnapshot] = await Promise.all([
        getDoc(eventRef),
        getDoc(guestRef).catch(() => null),
    ]);

    if (!eventSnapshot.exists()) throw new Error("This event no longer exists.");
    const event: InvitoEvent = normalizeEvent(eventSnapshot.id, eventSnapshot.data());

    const previous =
        guestSnapshot?.exists() === true
            ? normalizeGuest(guestSnapshot.id, guestSnapshot.data())
            : null;

    const decision = resolveRsvp({
        event,
        choice: input.status,
        plusOnes: input.plusOnes,
        previous,
    });

    if (decision.kind === "full") {
        throw new EventFullError(decision.seatsAvailable);
    }

    const rsvpDate = new Date().toISOString();

    await setDoc(guestRef, {
        name: input.name.trim().slice(0, 120),
        email: input.email.trim().toLowerCase().slice(0, 254),
        status: decision.status,
        plusOnes: decision.plusOnes,
        note: input.note.trim().slice(0, 500),
        answers: input.answers,
        rsvpDate,
    });

    if (decision.status === "attending") {
        await setDoc(publicRef, {
            firstName: input.name.trim().split(/\s+/)[0]?.slice(0, 60) || "Guest",
            plusOnes: decision.plusOnes,
            rsvpDate,
        });
    } else if (previous?.status === "attending") {
        await deleteDoc(publicRef).catch(() => undefined);
    }

    if (decision.attendeeDelta !== 0) {
        await updateDoc(eventRef, { attendees: decision.nextAttendees });
    }

    return {
        status: decision.status,
        isUpdate: previous !== null,
        plusOnes: decision.plusOnes,
    };
}

/** Looks up an existing RSVP so the form can prefill for an amendment. */
export async function lookupRsvp(eventId: string, email: string) {
    if (!email.includes("@")) return null;
    try {
        const guestId = await guestDocId(email);
        const snapshot = await getDoc(doc(db, "events", eventId, "guests", guestId));
        if (!snapshot.exists()) return null;
        return normalizeGuest(snapshot.id, snapshot.data());
    } catch {
        return null;
    }
}
