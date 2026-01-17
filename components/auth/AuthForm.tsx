"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile, AuthError } from "firebase/auth";
import { Eye, EyeOff, Mail, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

// Zod Schemas
const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthForm() {
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const signupForm = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onLogin = async (data: LoginValues) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            document.cookie = "session=true; path=/";
            toast.success("Welcome back!");
            router.push("/dashboard");
        } catch (error: unknown) {
            const authError = error as AuthError;
            toast.error(authError.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    const onSignup = async (data: SignupValues) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(userCredential.user, { displayName: data.name });
            document.cookie = "session=true; path=/"; // Simple client-side cookie for middleware
            toast.success("Account created successfully!");
            router.push("/dashboard");
        } catch (error: unknown) {
            const authError = error as AuthError;
            toast.error(authError.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    const onGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            document.cookie = "session=true; path=/"; // Simple client-side cookie for middleware
            toast.success("Signed in with Google!");
            router.push("/dashboard");
        } catch (error: unknown) {
            const authError = error as AuthError;
            toast.error(authError.message || "Google sign in failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px] mx-auto">
            <Card className="relative overflow-hidden border-none shadow-soft text-center px-4 py-6 bg-white dark:bg-card">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-accent-gold"></div>
                <CardHeader className="pb-4">
                    <div className="mx-auto bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full w-fit mb-4">
                        <PartyPopper className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Manage your RSVPs with elegance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
                            <TabsTrigger value="login" className="rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Log In</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            id="login-email"
                                            placeholder="you@example.com"
                                            className="pl-4 pr-10 py-6 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                            {...loginForm.register("email")}
                                        />
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                    {loginForm.formState.errors.email && (
                                        <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="login-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Password</Label>
                                        <Button variant="link" className="p-0 h-auto text-xs text-primary font-normal" type="button">Forgot?</Button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-4 pr-10 py-6 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                            {...loginForm.register("password")}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full py-6 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all bg-primary hover:bg-primary-dark rounded-xl mt-2" disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Log In →"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="py-6 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                        {...signupForm.register("name")}
                                    />
                                    {signupForm.formState.errors.name && (
                                        <p className="text-xs text-destructive">{signupForm.formState.errors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            id="signup-email"
                                            placeholder="you@example.com"
                                            className="pl-4 pr-10 py-6 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                            {...signupForm.register("email")}
                                        />
                                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                    {signupForm.formState.errors.email && (
                                        <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="signup-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-4 pr-10 py-6 bg-muted/30 border-muted focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                            {...signupForm.register("password")}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {signupForm.formState.errors.password && (
                                        <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full py-6 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all bg-primary hover:bg-primary-dark rounded-xl mt-2" disabled={isLoading}>
                                    {isLoading ? "Signing up..." : "Sign Up →"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-card px-2 text-muted-foreground opacity-70">
                                Or Continue With
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" className="w-full py-6 rounded-xl border-muted hover:bg-muted/30 hover:text-black transition-all" onClick={onGoogleSignIn} disabled={isLoading}>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">{activeTab === 'login' ? "New here? " : "Already have an account? "}</span>
                        <button onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')} className="text-primary font-semibold hover:underline">
                            {activeTab === 'login' ? "Create an account" : "Log In"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
