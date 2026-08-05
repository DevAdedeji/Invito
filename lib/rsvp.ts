import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { normalizeEvent, normalizeGuest } from "@/lib/events";
import { guestDocId } from "@/lib/guest-id";
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
    status: Exclude<RsvpStatus, "waitlisted">;
    plusOnes: number;
    note: string;
    answers: Record<string, string>;
}

export interface RsvpResult {
    status: RsvpStatus;
    isUpdate: boolean;
    plusOnes: number;
}

function headsFor(status: RsvpStatus, plusOnes: number): number {
    return status === "attending" ? 1 + plusOnes : 0;
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
    const publicRef = doc(
        db,
        "events",
        input.eventId,
        "attendees_public",
        guestId
    );
    const eventRef = doc(db, "events", input.eventId);

    const [eventSnapshot, guestSnapshot] = await Promise.all([
        getDoc(eventRef),
        getDoc(guestRef).catch(() => null),
    ]);

    if (!eventSnapshot.exists()) throw new Error("This event no longer exists.");
    const event: InvitoEvent = normalizeEvent(
        eventSnapshot.id,
        eventSnapshot.data()
    );

    const previous =
        guestSnapshot?.exists() === true
            ? normalizeGuest(guestSnapshot.id, guestSnapshot.data())
            : null;

    const plusOnes = event.allowPlusOnes
        ? Math.min(Math.max(0, input.plusOnes), event.maxPlusOnes)
        : 0;

    const previousHeads = previous
        ? headsFor(previous.status, previous.plusOnes)
        : 0;

    let status: RsvpStatus = input.status;
    let heads = headsFor(status, plusOnes);

    if (status === "attending" && event.capacity > 0) {
        const takenByOthers = Math.max(0, event.attendees - previousHeads);
        const available = event.capacity - takenByOthers;

        if (heads > available) {
            if (!event.waitlistEnabled) throw new EventFullError(Math.max(0, available));
            status = "waitlisted";
            heads = 0;
        }
    }

    const rsvpDate = new Date().toISOString();

    await setDoc(guestRef, {
        name: input.name.trim().slice(0, 120),
        email: input.email.trim().toLowerCase().slice(0, 254),
        status,
        plusOnes,
        note: input.note.trim().slice(0, 500),
        answers: input.answers,
        rsvpDate,
    });

    if (status === "attending") {
        await setDoc(publicRef, {
            firstName: input.name.trim().split(/\s+/)[0]?.slice(0, 60) || "Guest",
            plusOnes,
            rsvpDate,
        });
    } else if (previous?.status === "attending") {
        await deleteDoc(publicRef).catch(() => undefined);
    }

    const delta = heads - previousHeads;
    if (delta !== 0) {
        const ceiling = 1 + event.maxPlusOnes;
        const bounded = Math.max(-ceiling, Math.min(ceiling, delta));
        const next = Math.max(0, event.attendees + bounded);
        await updateDoc(eventRef, { attendees: next });
    }

    return { status, isUpdate: previous !== null, plusOnes };
}

/** Looks up an existing RSVP so the form can prefill for an amendment. */
export async function lookupRsvp(eventId: string, email: string) {
    if (!email.includes("@")) return null;
    try {
        const guestId = await guestDocId(email);
        const snapshot = await getDoc(
            doc(db, "events", eventId, "guests", guestId)
        );
        if (!snapshot.exists()) return null;
        return normalizeGuest(snapshot.id, snapshot.data());
    } catch {
        return null;
    }
}
