/**
 * A hint for the proxy so signed-out visitors are redirected before the
 * dashboard renders. It is not an authorisation boundary — Firestore security
 * rules are. Clearing it on sign-out is what the old code never did.
 */
const COOKIE = "session";

export function setSessionCookie() {
    document.cookie = `${COOKIE}=true; path=/; max-age=${60 * 60 * 24 * 14}; samesite=lax`;
}

export function clearSessionCookie() {
    document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`;
}
