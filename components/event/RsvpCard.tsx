"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { isFull, isPast, seatsLeft } from "@/lib/events";
import { EventFullError, lookupRsvp, submitRsvp } from "@/lib/rsvp";
import type { InvitoEvent, RsvpStatus } from "@/lib/types";

type Choice = "attending" | "not_attending" | "maybe";

const CHOICES: { value: Choice; label: string; hint: string }[] = [
    { value: "attending", label: "Joyfully accepts", hint: "Count me in" },
    { value: "maybe", label: "Hopes to attend", hint: "Not certain yet" },
    { value: "not_attending", label: "Regretfully declines", hint: "Can't make it" },
];

export default function RsvpCard({ event }: { event: InvitoEvent }) {
    const router = useRouter();

    const [choice, setChoice] = useState<Choice>("attending");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [plusOnes, setPlusOnes] = useState(0);
    const [note, setNote] = useState("");
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<RsvpStatus | null>(null);
    const [foundExisting, setFoundExisting] = useState(false);

    const past = isPast(event);
    const full = isFull(event);
    const left = seatsLeft(event);

    if (past) {
        return (
            <section className="border-rule border-t pt-10 text-center">
                <p className="meta text-ink-faint">Replies closed</p>
                <p className="text-ink-muted mt-3 text-sm">
                    This gathering has already taken place.
                </p>
            </section>
        );
    }

    if (result) {
        const copy: Record<RsvpStatus, { title: string; body: string }> = {
            attending: {
                title: "You're on the list",
                body: `We've noted your reply${plusOnes ? ` and your ${plusOnes} guest${plusOnes > 1 ? "s" : ""}` : ""}. Add it to your calendar so it doesn't slip.`,
            },
            waitlisted: {
                title: "You're on the waitlist",
                body: "The event is at capacity. We'll be in touch if a place opens up.",
            },
            maybe: {
                title: "Noted — a maybe",
                body: "Come back and change your reply any time using the same email.",
            },
            not_attending: {
                title: "Thank you for letting us know",
                body: "You'll be missed. Change your mind? Reply again with the same email.",
            },
        };

        const { title, body } = copy[result];

        return (
            <section className="border-rule border-t pt-12 text-center">
                <div className="border-seal text-seal mx-auto flex size-11 items-center justify-center rounded-full border">
                    <Check className="size-5" />
                </div>
                <h2 className="font-display mt-6 text-3xl">{title}</h2>
                <p className="text-ink-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                    {body}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button asChild variant="outline" size="sm">
                        <a href={`/events/${event.id}/calendar`}>Add to calendar</a>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setResult(null);
                            router.refresh();
                        }}
                    >
                        Change reply
                    </Button>
                </div>
            </section>
        );
    }

    const closedToNewAttendees = full && !event.waitlistEnabled;

    async function handleEmailBlur() {
        if (!email.includes("@") || foundExisting) return;
        const existing = await lookupRsvp(event.id, email);
        if (!existing) return;

        setFoundExisting(true);
        setName(existing.name);
        setPlusOnes(existing.plusOnes);
        setNote(existing.note);
        setAnswers(existing.answers);
        if (existing.status !== "waitlisted") setChoice(existing.status);
        toast.info("We found your earlier reply — edit it below.");
    }

    async function handleSubmit(formEvent: React.FormEvent) {
        formEvent.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.error("Please add your name and email.");
            return;
        }

        const missing = event.customQuestions.find(
            (q) => q.required && !answers[q.id]?.trim()
        );
        if (missing) {
            toast.error(`Please answer: ${missing.label}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const outcome = await submitRsvp({
                eventId: event.id,
                name,
                email,
                status: choice,
                plusOnes,
                note,
                answers,
            });

            setResult(outcome.status);
            router.refresh();
        } catch (error) {
            if (error instanceof EventFullError) {
                toast.error(
                    error.seatsLeft > 0
                        ? `Only ${error.seatsLeft} place${error.seatsLeft > 1 ? "s" : ""} left — please reduce your guests.`
                        : "This event just reached capacity."
                );
            } else {
                console.error("RSVP failed", error);
                toast.error("We couldn't save your reply. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="border-rule border-t pt-12">
            <div className="text-center">
                <p className="eyebrow justify-center">Kindly reply</p>
                <h2 className="font-display mt-5 text-3xl sm:text-4xl">
                    Will you join us?
                </h2>
                {event.capacity > 0 && left !== null && (
                    <p className="text-ink-faint mt-3 text-sm">
                        {full
                            ? event.waitlistEnabled
                                ? "At capacity — replies join the waitlist."
                                : "This event is full."
                            : `${left} of ${event.capacity} places remaining`}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-10">
                <div className="border-rule divide-rule divide-y border-y">
                    {CHOICES.map((option) => {
                        const selected = choice === option.value;
                        const disabled =
                            option.value === "attending" && closedToNewAttendees;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => setChoice(option.value)}
                                className={cn(
                                    "flex w-full items-center justify-between gap-4 px-1 py-5 text-left transition-colors",
                                    disabled
                                        ? "cursor-not-allowed opacity-40"
                                        : "hover:bg-paper-sunken/60"
                                )}
                            >
                                <span className="flex items-center gap-4">
                                    <span
                                        className={cn(
                                            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                                            selected ? "border-seal bg-seal" : "border-rule-strong"
                                        )}
                                    >
                                        {selected && (
                                            <span className="bg-paper size-1.5 rounded-full" />
                                        )}
                                    </span>
                                    <span>
                                        <span
                                            className={cn(
                                                "font-display block text-xl",
                                                selected ? "text-ink" : "text-ink-muted"
                                            )}
                                        >
                                            {option.label}
                                        </span>
                                        <span className="text-ink-faint mt-0.5 block text-xs">
                                            {disabled ? "No places left" : option.hint}
                                        </span>
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2.5">
                        <Label htmlFor="rsvp-name">Your name</Label>
                        <Input
                            id="rsvp-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ada Obi"
                            autoComplete="name"
                            required
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label htmlFor="rsvp-email">Email</Label>
                        <Input
                            id="rsvp-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={handleEmailBlur}
                            placeholder="ada@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                {event.allowPlusOnes && choice === "attending" && event.maxPlusOnes > 0 && (
                    <div className="border-rule flex items-center justify-between border-y py-5">
                        <div>
                            <p className="font-display text-lg">Bringing anyone?</p>
                            <p className="text-ink-faint mt-1 text-xs">
                                Up to {event.maxPlusOnes} additional guest
                                {event.maxPlusOnes > 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="subtle"
                                size="icon-sm"
                                onClick={() => setPlusOnes((n) => Math.max(0, n - 1))}
                                disabled={plusOnes === 0}
                                aria-label="One fewer guest"
                            >
                                <Minus />
                            </Button>
                            <span className="font-display w-6 text-center text-2xl tabular-nums">
                                {plusOnes}
                            </span>
                            <Button
                                type="button"
                                variant="subtle"
                                size="icon-sm"
                                onClick={() =>
                                    setPlusOnes((n) => Math.min(event.maxPlusOnes, n + 1))
                                }
                                disabled={plusOnes >= event.maxPlusOnes}
                                aria-label="One more guest"
                            >
                                <Plus />
                            </Button>
                        </div>
                    </div>
                )}

                {event.customQuestions.length > 0 && (
                    <div className="space-y-6">
                        {event.customQuestions.map((question) => (
                            <div key={question.id} className="space-y-2.5">
                                <Label htmlFor={`q-${question.id}`}>
                                    {question.label}
                                    {question.required && (
                                        <span className="text-seal ml-1">*</span>
                                    )}
                                </Label>

                                {question.type === "long" ? (
                                    <Textarea
                                        id={`q-${question.id}`}
                                        rows={3}
                                        value={answers[question.id] ?? ""}
                                        onChange={(e) =>
                                            setAnswers((a) => ({
                                                ...a,
                                                [question.id]: e.target.value,
                                            }))
                                        }
                                    />
                                ) : question.type === "choice" ? (
                                    <div className="flex flex-wrap gap-2">
                                        {question.options.map((option) => {
                                            const active = answers[question.id] === option;
                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() =>
                                                        setAnswers((a) => ({
                                                            ...a,
                                                            [question.id]: option,
                                                        }))
                                                    }
                                                    className={cn(
                                                        "meta rounded-xs border px-3 py-2 transition-colors",
                                                        active
                                                            ? "border-seal bg-seal-soft text-seal"
                                                            : "border-rule text-ink-muted hover:border-ink hover:text-ink"
                                                    )}
                                                >
                                                    {option}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Input
                                        id={`q-${question.id}`}
                                        value={answers[question.id] ?? ""}
                                        onChange={(e) =>
                                            setAnswers((a) => ({
                                                ...a,
                                                [question.id]: e.target.value,
                                            }))
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-2.5">
                    <Label htmlFor="rsvp-note">A note for the host (optional)</Label>
                    <Textarea
                        id="rsvp-note"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Allergies, arrival time, a message…"
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    variant={choice === "attending" ? "seal" : "default"}
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Sending
                        </>
                    ) : foundExisting ? (
                        "Update my reply"
                    ) : (
                        "Send my reply"
                    )}
                </Button>
            </form>
        </section>
    );
}
