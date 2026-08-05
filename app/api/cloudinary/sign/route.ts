import { v2 as cloudinary } from "cloudinary";

const FOLDER = "invito_events";

/**
 * Returns a signature *and* the api key. The uploader used to read
 * NEXT_PUBLIC_CLOUDINARY_API_KEY on the client, which was never set — so every
 * upload bailed out before it started. Handing the key back with the signature
 * keeps it in one place and out of the client bundle.
 */
export async function POST() {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
        return Response.json(
            { error: "Image uploads are not configured on this deployment." },
            { status: 500 }
        );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: FOLDER },
        apiSecret
    );

    return Response.json({ signature, timestamp, apiKey, cloudName, folder: FOLDER });
}
