"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/create-event/ImageUpload";
import { useAddPhoto, usePhotos } from "@/hooks/useEvents";

export default function Gallery({ eventId }: { eventId: string }) {
    const { data: photos, isLoading } = usePhotos(eventId, true);
    const addPhoto = useAddPhoto(eventId);

    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [uploaderName, setUploaderName] = useState("");

    async function handleAdd() {
        if (!url) {
            toast.error("Choose a photo first.");
            return;
        }

        try {
            await addPhoto.mutateAsync({ url, caption, uploaderName });
            setUrl("");
            setCaption("");
            toast.success("Added to the gallery.");
        } catch {
            toast.error("Couldn't add that photo.");
        }
    }

    return (
        <section className="border-rule border-t pt-12">
            <p className="eyebrow eyebrow-left">Gallery</p>

            <div className="mt-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="aspect-square w-full" />
                    </div>
                ) : photos?.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photos.map((photo) => (
                            <figure key={photo.id} className="group">
                                <div className="border-rule relative aspect-square overflow-hidden border">
                                    <Image
                                        src={photo.url}
                                        alt={photo.caption || `Photo by ${photo.uploaderName}`}
                                        fill
                                        sizes="(max-width: 640px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                {(photo.caption || photo.uploaderName) && (
                                    <figcaption className="text-ink-faint mt-2 text-xs">
                                        {photo.caption}
                                        {photo.caption && photo.uploaderName ? " · " : ""}
                                        {photo.uploaderName}
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                ) : (
                    <p className="text-ink-faint text-sm">
                        No photos yet. Add the first one below.
                    </p>
                )}
            </div>

            <div className="mt-8 space-y-4">
                <ImageUpload value={url} onChange={setUrl} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        value={uploaderName}
                        onChange={(e) => setUploaderName(e.target.value)}
                        placeholder="Your name"
                        aria-label="Your name"
                    />
                    <Input
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Caption (optional)"
                        aria-label="Caption"
                    />
                </div>
                <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    onClick={handleAdd}
                    disabled={addPhoto.isPending || !url}
                >
                    {addPhoto.isPending ? "Adding" : "Add to gallery"}
                </Button>
            </div>
        </section>
    );
}
