"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
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
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "At least 6 characters"),
});

type Values = z.infer<typeof schema>;

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const { errors, isSubmitting } = form.formState;

    async function onSubmit(values: Values) {
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            setSessionCookie();
            router.push("/dashboard");
        } catch (error) {
            toast.error(authErrorMessage(error));
        }
    }

    return (
        <AuthShell
            eyebrow="Welcome back"
            title="Sign in"
            subtitle="Pick up where you left off."
            footer={
                <>
                    New to Invito?{" "}
                    <Link
                        href="/auth/signup"
                        className="text-seal decoration-seal/40 hover:decoration-seal underline underline-offset-4"
                    >
                        Create an account
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

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/auth/reset"
                            className="meta text-seal hover:text-ink transition-colors"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
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
                            Signing in
                        </>
                    ) : (
                        "Sign in"
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
