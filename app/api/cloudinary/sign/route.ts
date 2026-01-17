
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
    const body = await request.json();

    const { paramsToSign } = body;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    if (!apiSecret) {
        console.error("Cloudinary API Secret not found in environment variables.");
        return Response.json({ error: "Missing Cloudinary API Secret" }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return Response.json({ signature });
}
