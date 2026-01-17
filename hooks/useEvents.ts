
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export interface Event {
    id: string;
    title: string;
    date: string; // ISO string
    location: string;
    attendees: number;
    capacity: number;
    imageUrl?: string;
    status: "active" | "draft" | "past";
    locationType: "physical" | "online";
}

const fetchEvents = async (userId: string | undefined): Promise<Event[]> => {
    if (!userId) return [];
    // NOTE: This requires a Firestore index if you add sorting later.
    const q = query(collection(db, "events"), where("creatorId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Event[];
};

const fetchEvent = async (eventId: string): Promise<Event | null> => {
    // This assumes we have a way to fetch a single doc. logic needs to import doc, getDoc
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Event;
    } else {
        return null;
    }
};

export function useEvents() {
    const [user] = useAuthState(auth);

    return useQuery({
        queryKey: ["events", user?.uid],
        queryFn: () => fetchEvents(user?.uid),
        enabled: !!user, // Only fetch when user is authenticated
    });
}

export function useEvent(eventId: string) {
    return useQuery({
        queryKey: ["event", eventId],
        queryFn: () => fetchEvent(eventId),
        enabled: !!eventId,
    });
}

export interface Guest {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "attending" | "not_attending" | "maybe" | "invited";
    guests: number;
    phone?: string;
    rsvpDate: string; // ISO string
}

const fetchGuests = async (eventId: string): Promise<Guest[]> => {
    // Assuming a subcollection "guests" under each event document
    const guestsRef = collection(db, "events", eventId, "guests");
    const snapshot = await getDocs(guestsRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Guest[];
};

export function useGuests(eventId: string) {
    return useQuery({
        queryKey: ["guests", eventId],
        queryFn: () => fetchGuests(eventId),
        enabled: !!eventId,
    });
}
