
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
    const body = await request.json();
    const { paramsToSign } = body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
        return Response.json({ error: "Missing Cloudinary API Secret" }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return Response.json({ signature });
}
