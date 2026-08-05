"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordAnnouncement } from "@/hooks/useEvents";
import type { Guest, InvitoEvent } from "@/lib/types";

interface AnnounceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: InvitoEvent;
    guests: Guest[];
}

type Audience = "attending" | "all";

export default function AnnounceDialog({
    open,
    onOpenChange,
    event,
    guests,
}: AnnounceDialogProps) {
    const [subject, setSubject] = useState(`Update: ${event.title}`);
    const [body, setBody] = useState("");
    const [audience, setAudience] = useState<Audience>("attending");
    const [isSending, setIsSending] = useState(false);

    const recipients = guests
        .filter((g) => (audience === "attending" ? g.status === "attending" : true))
        .map((g) => g.email)
        .filter(Boolean);

    function openMailDraft() {
        const url = `mailto:?bcc=${encodeURIComponent(
            recipients.join(",")
        )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    }

    async function handleSend() {
        if (!subject.trim() || !body.trim()) {
            toast.error("Add a subject and a message.");
            return;
        }
        if (recipients.length === 0) {
            toast.error("Nobody to send to yet.");
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch("/api/announce", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    body,
                    recipients,
                    eventTitle: event.title,
                }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? "Could not send");
            }

            if (result.configured === false) {
                toast.info("Email sending isn't set up — opening a draft instead.");
                openMailDraft();
                await recordAnnouncement(event.id, {
                    subject,
                    body,
                    recipientCount: recipients.length,
                    delivered: false,
                });
            } else {
                toast.success(
                    `Sent to ${result.sent} guest${result.sent === 1 ? "" : "s"}.`
                );
                await recordAnnouncement(event.id, {
                    subject,
                    body,
                    recipientCount: result.sent,
                    delivered: true,
                });
            }

            setBody("");
            onOpenChange(false);
        } catch (error) {
            console.error("Announcement failed", error);
            toast.error(
                error instanceof Error ? error.message : "Couldn't send that."
            );
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Message your guests</DialogTitle>
                    <DialogDescription>
                        Everyone is blind-copied, so guests never see each other&rsquo;s
                        addresses.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="space-y-2.5">
                        <Label>Send to</Label>
                        <div className="flex gap-2">
                            {(
                                [
                                    { value: "attending", label: "Attending only" },
                                    { value: "all", label: "Everyone who replied" },
                                ] as const
                            ).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setAudience(option.value)}
                                    className={`meta rounded-xs border px-3 py-2 transition-colors ${audience === option.value
                                        ? "border-seal bg-seal-soft text-seal"
                                        : "border-rule text-ink-muted hover:border-ink hover:text-ink"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-ink-faint text-xs">
                            {recipients.length} recipient
                            {recipients.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="announce-subject">Subject</Label>
                        <Input
                            id="announce-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="announce-body">Message</Label>
                        <Textarea
                            id="announce-body"
                            rows={7}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="A small change to the plan…"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isSending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Sending
                            </>
                        ) : (
                            <>
                                <Send />
                                Send update
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
