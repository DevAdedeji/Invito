
"use client";

import { EventFormValues } from "@/app/dashboard/create-event/page";
import { format } from "date-fns";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
    formValues: EventFormValues;
}

export function LivePreview({ formValues }: LivePreviewProps) {
    const { title, hostName, startDate, startTime, endTime, location, imageUrl, description, eventType } = formValues;

    return (
        <div className="w-full max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-zinc-800">
            <div className="relative h-64 w-full bg-gray-100 dark:bg-zinc-800">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt="Event cover"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-sm">Cover Image</span>
                    </div>
                )}

                {startDate && (
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-xl p-2 text-center min-w-[60px] shadow-sm">
                        <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">
                            {format(startDate, "MMM")}
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {format(startDate, "d")}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
                        {title || "Event Title"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Hosted by <span className="font-semibold text-gray-900 dark:text-gray-200 decoration-violet-500 underline decoration-2">{hostName || "Host Name"}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {startDate ? format(startDate, "EEEE, MMMM d") : "Date"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {startTime || "Start"} - {endTime || "End"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {location || "Location"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                Click for map
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attendees Stack Placeholder */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[10px]">
                                User
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        0 going
                    </span>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
                <button className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-600/20 text-sm">
                    Example Button
                </button>
            </div>

        </div>
    );
}
