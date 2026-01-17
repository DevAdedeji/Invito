
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

            if (!cloudName || !apiKey) {
                console.error("Missing Cloudinary configuration (Cloud Name or API Key)");
                // Show error or fallback
                alert("Cloudinary configuration missing. Check environment variables.");
                setLoading(false);
                return;
            }

            // 1. Get a signature from our API
            const timestamp = Math.round((new Date()).getTime() / 1000);
            const paramsToSign = {
                timestamp: timestamp,
                folder: "invito_events", // optional folder
            };

            const signatureResponse = await fetch('/api/cloudinary/sign', {
                method: 'POST',
                body: JSON.stringify({ paramsToSign }),
            });

            if (!signatureResponse.ok) {
                throw new Error("Failed to get signature");
            }

            const { signature } = await signatureResponse.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", "invito_events");

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.message || "Upload failed");
            }

            const data = await uploadResponse.json();

            // Return the secure url
            onChange(data.secure_url);

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. See console for details.");
        } finally {
            setLoading(false);
        }
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 1,
        disabled: disabled || loading
    });

    return (
        <div className={cn("relative group", disabled && "opacity-50 cursor-not-allowed")}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[200px]",
                    isDragActive && "border-violet-500 bg-violet-50 dark:bg-violet-900/10",
                    value && "border-solid border-gray-100 dark:border-zinc-800 p-0 overflow-hidden bg-gray-100 dark:bg-zinc-800"
                )}
            >
                <input {...getInputProps()} />

                {value ? (
                    <div className="relative w-full h-[200px]">
                        <Image src={value} alt="Upload" fill className="object-cover" />
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/80 rounded-full hover:bg-white dark:hover:bg-black transition-colors cursor-pointer z-10"
                        >
                            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-full text-violet-600 dark:text-violet-400">
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
                            ) : (
                                <ImageIcon className="w-6 h-6" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {loading ? "Uploading..." : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                SVG, PNG, JPG or GIF (max. 800x400px)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
