"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth, db } from "@/lib/firebase";
import {
    normalizeEvent,
    normalizeGuest,
    normalizePublicAttendee,
} from "@/lib/events";
import type {
    DiscussionMessage,
    GalleryPhoto,
    Guest,
    InvitoEvent,
    PublicAttendee,
} from "@/lib/types";
import { toIso } from "@/lib/events";

export type { Guest, InvitoEvent } from "@/lib/types";

async function fetchEvents(userId: string | undefined): Promise<InvitoEvent[]> {
    if (!userId) return [];

    const snapshot = await getDocs(
        query(collection(db, "events"), where("creatorId", "==", userId))
    );

    return snapshot.docs
        .map((d) => normalizeEvent(d.id, d.data()))
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

async function fetchEvent(eventId: string): Promise<InvitoEvent | null> {
    const snapshot = await getDoc(doc(db, "events", eventId));
    if (!snapshot.exists()) return null;
    return normalizeEvent(snapshot.id, snapshot.data());
}

async function fetchGuests(eventId: string): Promise<Guest[]> {
    const snapshot = await getDocs(collection(db, "events", eventId, "guests"));
    return snapshot.docs
        .map((d) => normalizeGuest(d.id, d.data()))
        .sort((a, b) => Date.parse(b.rsvpDate) - Date.parse(a.rsvpDate));
}

async function fetchPublicAttendees(eventId: string): Promise<PublicAttendee[]> {
    const snapshot = await getDocs(
        collection(db, "events", eventId, "attendees_public")
    );
    return snapshot.docs
        .map((d) => normalizePublicAttendee(d.id, d.data()))
        .sort((a, b) => Date.parse(a.rsvpDate) - Date.parse(b.rsvpDate));
}

export function useEvents() {
    const [user] = useAuthState(auth);

    return useQuery({
        queryKey: ["events", user?.uid],
        queryFn: () => fetchEvents(user?.uid),
        enabled: !!user,
    });
}

export function useEvent(eventId: string) {
    return useQuery({
        queryKey: ["event", eventId],
        queryFn: () => fetchEvent(eventId),
        enabled: !!eventId,
    });
}

export function useGuests(eventId: string) {
    return useQuery({
        queryKey: ["guests", eventId],
        queryFn: () => fetchGuests(eventId),
        enabled: !!eventId,
    });
}

export function usePublicAttendees(eventId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["attendees-public", eventId],
        queryFn: () => fetchPublicAttendees(eventId),
        enabled: !!eventId && enabled,
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    const [user] = useAuthState(auth);

    return useMutation({
        mutationFn: async (eventId: string) => {
            // Subcollections do not cascade. Clear what the host can enumerate so
            // a deleted event does not strand guest records.
            const subcollections = [
                "guests",
                "attendees_public",
                "messages",
                "photos",
                "announcements",
            ];

            for (const name of subcollections) {
                try {
                    const snapshot = await getDocs(
                        collection(db, "events", eventId, name)
                    );
                    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
                } catch {
                    // A subcollection the rules will not enumerate is not fatal.
                }
            }

            await deleteDoc(doc(db, "events", eventId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events", user?.uid] });
        },
    });
}

export function useDuplicateEvent() {
    const queryClient = useQueryClient();
    const [user] = useAuthState(auth);

    return useMutation({
        mutationFn: async (event: InvitoEvent) => {
            if (!user) throw new Error("You must be signed in.");

            const created = await addDoc(collection(db, "events"), {
                title: `${event.title} (copy)`,
                hostName: event.hostName,
                eventType: event.eventType,
                description: event.description,
                imageUrl: event.imageUrl,
                date: event.date,
                endDate: event.endDate,
                startDateTime: new Date(event.date),
                endDateTime: event.endDate ? new Date(event.endDate) : null,
                timezone: event.timezone,
                location: event.location,
                locationType: event.locationType,
                capacity: event.capacity,
                attendees: 0,
                allowPlusOnes: event.allowPlusOnes,
                maxPlusOnes: event.maxPlusOnes,
                waitlistEnabled: event.waitlistEnabled,
                guestListPublic: event.guestListPublic,
                discussionEnabled: event.discussionEnabled,
                galleryEnabled: event.galleryEnabled,
                customQuestions: event.customQuestions,
                creatorId: user.uid,
                status: "draft",
                createdAt: serverTimestamp(),
            });

            return created.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events", user?.uid] });
        },
    });
}

export function useRemoveGuest(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (guest: Guest) => {
            await deleteDoc(doc(db, "events", eventId, "guests", guest.id));
            try {
                await deleteDoc(
                    doc(db, "events", eventId, "attendees_public", guest.id)
                );
            } catch {
                // Already gone.
            }

            if (guest.status === "attending") {
                const eventRef = doc(db, "events", eventId);
                const snapshot = await getDoc(eventRef);
                const current = snapshot.exists()
                    ? normalizeEvent(snapshot.id, snapshot.data()).attendees
                    : 0;
                await updateDoc(eventRef, {
                    attendees: Math.max(0, current - (1 + guest.plusOnes)),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
        },
    });
}

async function fetchMessages(eventId: string): Promise<DiscussionMessage[]> {
    const snapshot = await getDocs(
        query(collection(db, "events", eventId, "messages"), orderBy("createdAt", "asc"))
    );
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            authorName: String(data.authorName ?? "Guest"),
            body: String(data.body ?? ""),
            createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
            isHost: Boolean(data.isHost),
        };
    });
}

export function useMessages(eventId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["messages", eventId],
        queryFn: () => fetchMessages(eventId),
        enabled: !!eventId && enabled,
    });
}

export function usePostMessage(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            authorName: string;
            body: string;
            isHost: boolean;
        }) => {
            await addDoc(collection(db, "events", eventId, "messages"), {
                authorName: input.authorName.trim().slice(0, 80),
                body: input.body.trim().slice(0, 1000),
                isHost: input.isHost,
                createdAt: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", eventId] });
        },
    });
}

async function fetchPhotos(eventId: string): Promise<GalleryPhoto[]> {
    const snapshot = await getDocs(
        query(collection(db, "events", eventId, "photos"), orderBy("createdAt", "desc"))
    );
    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            url: String(data.url ?? ""),
            caption: String(data.caption ?? ""),
            uploaderName: String(data.uploaderName ?? "Guest"),
            createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
        };
    });
}

export function usePhotos(eventId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["photos", eventId],
        queryFn: () => fetchPhotos(eventId),
        enabled: !!eventId && enabled,
    });
}

export function useAddPhoto(eventId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            url: string;
            caption: string;
            uploaderName: string;
        }) => {
            await addDoc(collection(db, "events", eventId, "photos"), {
                url: input.url,
                caption: input.caption.trim().slice(0, 200),
                uploaderName: input.uploaderName.trim().slice(0, 80) || "Guest",
                createdAt: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
        },
    });
}

export async function recordAnnouncement(
    eventId: string,
    input: {
        subject: string;
        body: string;
        recipientCount: number;
        delivered: boolean;
    }
) {
    await setDoc(
        doc(collection(db, "events", eventId, "announcements")),
        { ...input, sentAt: new Date().toISOString() }
    );
}
