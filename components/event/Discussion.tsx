"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages, usePostMessage } from "@/hooks/useEvents";
import { formatRelative } from "@/lib/datetime";

export default function Discussion({ eventId }: { eventId: string }) {
    const { data: messages, isLoading } = useMessages(eventId, true);
    const postMessage = usePostMessage(eventId);

    const [authorName, setAuthorName] = useState("");
    const [body, setBody] = useState("");

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!authorName.trim() || !body.trim()) {
            toast.error("Add your name and a message.");
            return;
        }

        try {
            await postMessage.mutateAsync({ authorName, body, isHost: false });
            setBody("");
        } catch {
            toast.error("Couldn't post that. Please try again.");
        }
    }

    return (
        <section className="border-rule border-t pt-12">
            <p className="eyebrow eyebrow-left">Notes from guests</p>

            <div className="mt-8 space-y-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </>
                ) : messages?.length ? (
                    messages.map((message) => (
                        <article key={message.id} className="border-rule border-b pb-6">
                            <div className="flex items-baseline justify-between gap-4">
                                <p className="font-display text-lg">
                                    {message.authorName}
                                    {message.isHost && (
                                        <span className="text-seal meta ml-2">Host</span>
                                    )}
                                </p>
                                <time className="meta text-ink-faint shrink-0">
                                    {formatRelative(message.createdAt)}
                                </time>
                            </div>
                            <p className="text-ink-muted mt-2 text-sm leading-relaxed whitespace-pre-line">
                                {message.body}
                            </p>
                        </article>
                    ))
                ) : (
                    <p className="text-ink-faint text-sm">
                        No notes yet — be the first to say something.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name"
                    aria-label="Your name"
                />
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    placeholder="Leave a note for the host and other guests…"
                    aria-label="Your message"
                />
                <Button
                    type="submit"
                    variant="subtle"
                    size="sm"
                    disabled={postMessage.isPending}
                >
                    {postMessage.isPending ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Posting
                        </>
                    ) : (
                        "Post note"
                    )}
                </Button>
            </form>
        </section>
    );
}
