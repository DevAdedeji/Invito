"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { EventForm } from "@/components/create-event/EventForm";
import { LivePreview } from "@/components/create-event/LivePreview";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { auth, db } from "@/lib/firebase";
import {
    buildEventPayload,
    eventFormSchema,
    type EventFormValues,
} from "@/lib/event-form";

interface EventEditorProps {
    mode: "create" | "edit";
    eventId?: string;
    defaultValues: EventFormValues;
}

export default function EventEditor({
    mode,
    eventId,
    defaultValues,
}: EventEditorProps) {
    const [user] = useAuthState(auth);
    const router = useRouter();

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues,
        mode: "onBlur",
    });

    async function onSubmit(values: EventFormValues) {
        if (!user) {
            toast.error("You need to be signed in.");
            return;
        }

        try {
            const payload = buildEventPayload(values, user.uid);

            if (mode === "edit" && eventId) {
                await updateDoc(doc(db, "events", eventId), payload);
                toast.success("Invitation updated.");
                router.push(`/dashboard/events/${eventId}`);
            } else {
                const created = await addDoc(collection(db, "events"), {
                    ...payload,
                    attendees: 0,
                    createdAt: serverTimestamp(),
                });
                toast.success("Invitation created.");
                router.push(`/dashboard/events/${created.id}`);
            }
            router.refresh();
        } catch (error) {
            console.error("Saving the event failed", error);
            toast.error("We couldn't save that. Please try again.");
        }
    }

    const values = useWatch({
        control: form.control,
        defaultValue: defaultValues,
    }) as EventFormValues;
    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="eyebrow eyebrow-left">
                            {mode === "edit" ? "Edit invitation" : "New invitation"}
                        </p>
                        <h1 className="font-display mt-6 text-4xl sm:text-5xl">
                            {mode === "edit"
                                ? "Change the details"
                                : "Set the scene"}
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Saving
                                </>
                            ) : mode === "edit" ? (
                                "Save changes"
                            ) : (
                                "Create invitation"
                            )}
                        </Button>
                    </div>
                </header>

                <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-16">
                    <EventForm form={form} />

                    <aside className="hidden lg:block">
                        <div className="sticky top-28">
                            <p className="meta text-ink-faint mb-4">Live preview</p>
                            <LivePreview values={values} />
                        </div>
                    </aside>
                </div>

                <div className="border-rule mt-14 flex justify-end gap-3 border-t pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Saving
                            </>
                        ) : mode === "edit" ? (
                            "Save changes"
                        ) : (
                            "Create invitation"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
