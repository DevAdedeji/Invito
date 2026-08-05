import type { AuthError } from "firebase/auth";

/**
 * `signInWithPopup` loads https://<authDomain>/__/auth/handler, which is served
 * by Firebase Hosting. If Hosting was never provisioned for the project that
 * host refuses connections, the popup dies on a browser error page, and Firebase
 * reports it as a closed popup or an internal error — neither of which points at
 * the real cause. These messages name it.
 */
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "";

export function authErrorMessage(error: unknown): string {
    const code = (error as AuthError)?.code ?? "";

    switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "That email and password don't match.";
        case "auth/invalid-email":
            return "That email address doesn't look right.";
        case "auth/email-already-in-use":
            return "An account already exists for that email.";
        case "auth/weak-password":
            return "Please choose a longer password.";
        case "auth/too-many-requests":
            return "Too many attempts. Try again shortly.";
        case "auth/popup-blocked":
            return "Your browser blocked the sign-in popup. Allow popups and retry.";
        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
            return "Sign-in was cancelled.";
        case "auth/unauthorized-domain":
            return `This domain isn't in the Firebase authorised list. Add it under Authentication → Settings → Authorised domains.`;
        case "auth/internal-error":
        case "auth/network-request-failed":
            return AUTH_DOMAIN
                ? `Couldn't reach ${AUTH_DOMAIN}. Enable Firebase Hosting for this project so the sign-in handler is served.`
                : "Couldn't reach the authentication service.";
        case "auth/operation-not-allowed":
            return "This sign-in method is disabled in the Firebase console.";
        default:
            return "Something went wrong. Please try again.";
    }
}
