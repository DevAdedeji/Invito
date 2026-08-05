"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(
        async (files: File[]) => {
            const file = files[0];
            if (!file) return;

            if (file.size > MAX_BYTES) {
                toast.error("That image is over 10MB. Try a smaller one.");
                return;
            }

            setLoading(true);
            try {
                const signResponse = await fetch("/api/cloudinary/sign", {
                    method: "POST",
                });
                const signed = await signResponse.json();

                if (!signResponse.ok) {
                    throw new Error(signed.error ?? "Could not sign the upload");
                }

                const body = new FormData();
                body.append("file", file);
                body.append("api_key", signed.apiKey);
                body.append("timestamp", String(signed.timestamp));
                body.append("signature", signed.signature);
                body.append("folder", signed.folder);

                const uploadResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
                    { method: "POST", body }
                );
                const uploaded = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(uploaded?.error?.message ?? "Upload failed");
                }

                onChange(uploaded.secure_url);
            } catch (error) {
                console.error("Image upload failed", error);
                toast.error(
                    error instanceof Error ? error.message : "Upload failed. Try again."
                );
            } finally {
                setLoading(false);
            }
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif"] },
        maxFiles: 1,
        disabled: disabled || loading,
    });

    if (value) {
        return (
            <div className="border-rule relative aspect-16/10 w-full overflow-hidden border">
                <Image src={value} alt="Cover" fill className="object-cover" />
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="bg-paper/90 text-ink hover:bg-paper absolute top-3 right-3 rounded-xs p-1.5 transition-colors"
                    aria-label="Remove cover image"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-rule hover:border-ink flex aspect-16/10 w-full cursor-pointer flex-col items-center justify-center gap-3 border border-dashed transition-colors",
                isDragActive && "border-seal bg-seal-soft",
                (disabled || loading) && "pointer-events-none opacity-60"
            )}
        >
            <input {...getInputProps()} />
            {loading ? (
                <Loader2 className="text-ink-faint size-5 animate-spin" />
            ) : (
                <ImagePlus className="text-ink-faint size-5" />
            )}
            <div className="text-center">
                <p className="text-sm">
                    {loading ? "Uploading…" : "Drop a cover image, or click to choose"}
                </p>
                <p className="text-ink-faint mt-1 text-xs">JPG, PNG or WebP · up to 10MB</p>
            </div>
        </div>
    );
}
