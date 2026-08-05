/**
 * Guest documents are keyed by a hash of the guest's email.
 *
 * This is what lets a guest amend their own RSVP without an account while the
 * security rules keep `list` host-only: you can reach a document whose id you
 * can derive (your own address), but you cannot enumerate the collection.
 */
export async function guestDocId(email: string): Promise<string> {
    const normalized = email.trim().toLowerCase();
    const bytes = new TextEncoder().encode(`invito:${normalized}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
}
