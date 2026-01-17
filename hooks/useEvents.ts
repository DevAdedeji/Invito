
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
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

export function useEvents() {
    const [user] = useAuthState(auth);

    return useQuery({
        queryKey: ["events", user?.uid],
        queryFn: () => fetchEvents(user?.uid),
        enabled: !!user, // Only fetch when user is authenticated
    });
}
