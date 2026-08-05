import { ImageResponse } from "next/og";

import { formatLongDate, formatTime } from "@/lib/datetime";
import { fetchEventServer } from "@/lib/firestore-rest";

export const alt = "You're invited";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#FAF8F3";
const INK = "#1C1917";
const INK_MUTED = "#6B6560";
const RULE = "#E3DDD2";
const SEAL = "#8C3A2B";

async function loadFraunces(text: string): Promise<ArrayBuffer | null> {
    try {
        const cssUrl = `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&text=${encodeURIComponent(
            text
        )}`;
        // Sending no User-Agent makes Google Fonts reply with TrueType. A browser
        // UA gets woff2 back, which Satori cannot parse.
        const css = await fetch(cssUrl, { next: { revalidate: 86400 } }).then((r) =>
            r.ok ? r.text() : ""
        );

        const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/);
        if (!match) return null;

        const font = await fetch(match[1], { next: { revalidate: 86400 } });
        return font.ok ? await font.arrayBuffer() : null;
    } catch {
        return null;
    }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await fetchEventServer(id, 300);

    const title = event?.title ?? "You're invited";
    const host = event?.hostName ? `Hosted by ${event.hostName}` : "";
    const when = event
        ? `${formatLongDate(event.date, event.timezone)} · ${formatTime(
            event.date,
            event.timezone
        )}`
        : "";
    const where = event
        ? event.locationType === "online"
            ? "Online"
            : event.location
        : "";

    const fontData = await loadFraunces(`${title}${host}Invito`);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: PAPER,
                    padding: 64,
                    fontFamily: fontData ? "Fraunces" : "serif",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            color: SEAL,
                            fontSize: 20,
                            letterSpacing: 6,
                            textTransform: "uppercase",
                        }}
                    >
                        <div style={{ width: 40, height: 1, background: RULE }} />
                        <span>Invitation</span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: title.length > 44 ? 68 : 92,
                            color: INK,
                            lineHeight: 1.05,
                            letterSpacing: -2,
                            maxWidth: 1000,
                        }}
                    >
                        {title}
                    </div>

                    {host ? (
                        <div style={{ display: "flex", fontSize: 30, color: INK_MUTED }}>
                            {host}
                        </div>
                    ) : null}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ width: "100%", height: 1, background: RULE }} />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                fontSize: 26,
                                color: INK,
                            }}
                        >
                            <span>{when}</span>
                            <span style={{ color: INK_MUTED }}>{where}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                fontSize: 22,
                                letterSpacing: 8,
                                color: INK_MUTED,
                                textTransform: "uppercase",
                            }}
                        >
                            Invito
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: fontData
                ? [{ name: "Fraunces", data: fontData, style: "normal", weight: 600 }]
                : undefined,
        }
    );
}
