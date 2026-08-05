"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth-errors";
import { setSessionCookie } from "@/lib/session";

const schema = z.object({
    name: z.string().min(2, "Tell us your name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "At least 6 characters"),
});

type Values = z.infer<typeof schema>;

export default function SignupForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const { errors, isSubmitting } = form.formState;

    async function onSubmit(values: Values) {
        try {
            const credential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );
            await updateProfile(credential.user, {
                displayName: values.name.trim(),
            });
            setSessionCookie();
            router.push("/dashboard");
        } catch (error) {
            toast.error(authErrorMessage(error));
        }
    }

    return (
        <AuthShell
            eyebrow="Get started"
            title="Create an account"
            subtitle="Your first invitation is a few minutes away."
            footer={
                <>
                    Already have an account?{" "}
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
                    <Label htmlFor="name">Your name</Label>
                    <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Ada Obi"
                        {...form.register("name")}
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                        <p className="text-destructive text-xs">{errors.name.message}</p>
                    )}
                </div>

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

                <div className="space-y-2.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
                            className="pr-11"
                            {...form.register("password")}
                            aria-invalid={!!errors.password}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="text-ink-faint hover:text-ink absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-destructive text-xs">
                            {errors.password.message}
                        </p>
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
                            Creating account
                        </>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
                <span className="bg-rule h-px flex-1" />
                <span className="meta text-ink-faint">or</span>
                <span className="bg-rule h-px flex-1" />
            </div>

            <GoogleButton disabled={isSubmitting} />
        </AuthShell>
    );
}
