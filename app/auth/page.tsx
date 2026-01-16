
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
            <AuthForm />
            <div className="mt-8 text-center text-xs text-muted-foreground">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
        </div>
    );
}
