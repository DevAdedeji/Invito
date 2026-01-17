
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EventForm } from "@/components/create-event/EventForm";
import { LivePreview } from "@/components/create-event/LivePreview";
import { Form } from "@/components/ui/form";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    hostName: z.string().min(2, "Host name is required"),
    eventType: z.string().min(1, "Event type is required"),
    startDate: z.date({ message: "Start date is required" }),
    endDate: z.date({ message: "End date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    location: z.string().min(2, "Location is required"),
    description: z.string().max(2500, "Description must be less than 2500 characters").optional(),
    imageUrl: z.string().optional(),
});

export type EventFormValues = z.infer<typeof formSchema>;

export default function CreateEventPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const form = useForm<EventFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            hostName: "",
            eventType: "social",
            location: "",
            description: "",
            startTime: "16:00",
            endTime: "22:00",
        },
    });

    async function onSubmit(values: EventFormValues) {
        if (!user) {
            toast.error("You must be logged in to create an event");
            return;
        }

        try {
            // Construct standard JS Date objects combining date and time
            // Note: For simplicity, we are saving them separately or as strings for now,
            // but typically one would combine them. The form values are what they are.


            // Construct payload, ensuring no undefined values
            // Construct payload, ensuring no undefined values
            const payload = {
                ...values,
                imageUrl: values.imageUrl || null,
                description: values.description || null,
                creatorId: user.uid, // Changed from userId to creatorId to match hook
                userId: user.uid, // Keeping access for both just in case
                createdAt: serverTimestamp(),
                // Combine date and time for easier querying later if needed
                startDateTime: new Date(`${formatDate(values.startDate)}T${values.startTime}`),
                endDateTime: new Date(`${formatDate(values.endDate)}T${values.endTime}`),
                // Add fields expected by EventCard/useEvents interface that might be missing
                date: new Date(`${formatDate(values.startDate)}T${values.startTime}`).toISOString(),
                attendees: 0,
                capacity: 100, // Default capacity or add field
                status: 'active'
            };

            await addDoc(collection(db, "events"), payload);

            toast.success("Event created successfully!");
            router.push("/dashboard");

        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to create event. Please try again.");
        }
    }

    // Helper to format date as YYYY-MM-DD for constructor
    function formatDate(date: Date) {
        return date.toISOString().split('T')[0];
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h1>
                <p className="text-gray-500 dark:text-gray-400">Fill in the details to launch your next gathering.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <EventForm form={form} />
                        </form>
                    </Form>
                </div>

                <div className="hidden lg:block relative">
                    <div className="sticky top-8">
                        <LivePreview formValues={form.watch()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
