/**
 * Sends an update to a guest list via Resend, when it is configured.
 *
 * If RESEND_API_KEY is absent the route reports `configured: false` instead of
 * pretending to have sent anything, and the dashboard falls back to opening a
 * pre-filled mail draft.
 */

interface AnnouncePayload {
    subject?: unknown;
    body?: unknown;
    recipients?: unknown;
    eventTitle?: unknown;
    replyTo?: unknown;
}

const MAX_RECIPIENTS = 500;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
        return Response.json({ configured: false, sent: 0 });
    }

    let payload: AnnouncePayload;
    try {
        payload = await request.json();
    } catch {
        return Response.json({ error: "Malformed request" }, { status: 400 });
    }

    const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    const eventTitle =
        typeof payload.eventTitle === "string" ? payload.eventTitle : "your event";
    const replyTo = typeof payload.replyTo === "string" ? payload.replyTo : undefined;

    const recipients = Array.isArray(payload.recipients)
        ? payload.recipients
            .filter((r): r is string => typeof r === "string" && r.includes("@"))
            .slice(0, MAX_RECIPIENTS)
        : [];

    if (!subject || !body) {
        return Response.json(
            { error: "A subject and a message are required" },
            { status: 400 }
        );
    }

    if (recipients.length === 0) {
        return Response.json({ error: "No valid recipients" }, { status: 400 });
    }

    const html = `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px;color:#1c1917">
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8c3a2b;margin:0 0 24px">
      ${escapeHtml(eventTitle)}
    </p>
    <div style="font-size:15px;line-height:1.75;white-space:pre-line">${escapeHtml(body)}</div>
    <hr style="border:0;border-top:1px solid #e3ddd2;margin:32px 0" />
    <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9c948b;margin:0">
      Sent with Invito
    </p>
  </div>`;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                // Recipients go in BCC so guests never see each other's addresses.
                to: from,
                bcc: recipients,
                subject,
                html,
                ...(replyTo ? { reply_to: replyTo } : {}),
            }),
        });

        if (!response.ok) {
            const detail = await response.text();
            console.error("Resend rejected the announcement", detail);
            return Response.json(
                { error: "The email provider rejected the message" },
                { status: 502 }
            );
        }

        return Response.json({ configured: true, sent: recipients.length });
    } catch (error) {
        console.error("Announcement failed", error);
        return Response.json({ error: "Could not send" }, { status: 500 });
    }
}
