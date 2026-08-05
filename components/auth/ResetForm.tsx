"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth-errors";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

export default function ResetForm() {
    const [sentTo, setSentTo] = useState<string | null>(null);

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const { errors, isSubmitting } = form.formState;

    async function onSubmit(values: Values) {
        try {
            await sendPasswordResetEmail(auth, values.email);
            setSentTo(values.email);
        } catch (error) {
            toast.error(authErrorMessage(error));
        }
    }

    if (sentTo) {
        return (
            <AuthShell
                eyebrow="Check your inbox"
                title="Link sent"
                subtitle={`If an account exists for ${sentTo}, a reset link is on its way. It expires in an hour.`}
                footer={
                    <Link
                        href="/auth/login"
                        className="text-seal decoration-seal/40 hover:decoration-seal underline underline-offset-4"
                    >
                        Back to sign in
                    </Link>
                }
            >
                <div className="border-seal text-seal mx-auto flex size-11 items-center justify-center rounded-full border">
                    <Check className="size-5" />
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="mx-auto mt-8 flex"
                    onClick={() => setSentTo(null)}
                >
                    Use a different email
                </Button>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            eyebrow="Password reset"
            title="Forgotten it?"
            subtitle="Tell us your email and we'll send a link to set a new password."
            footer={
                <>
                    Remembered it?{" "}
                    <Link
                        href="/auth/login"
                        className="text-seal decoration-seal/40 hover:decoration-seal underline underline-offset-4"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...form.register("email")}
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                        <p className="text-destructive text-xs">{errors.email.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Sending
                        </>
                    ) : (
                        "Send reset link"
                    )}
                </Button>
            </form>
        </AuthShell>
    );
}
