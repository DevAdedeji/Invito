
"use client";

import { EventFormValues } from "@/app/dashboard/create-event/page";
import { format } from "date-fns";
import { MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

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
                            {formValues.locationType === 'online' ? <LinkIcon className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                                {location || "Location"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                {formValues.locationType === 'online'
                                    ? (location?.startsWith('http') ? "Join via Link" : "Online Event")
                                    : "Click for map"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attendees Stack Placeholder */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex -space-x-2">
                        <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a smiling woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFenvZkgOZ5mC80BonCRo9nBSZvn85_DPx9cOg25cT4NNnh4cTMdet6THJIbc-clBZJGUHMOGEpVAZg9JoVmAgwE2sS0ZEaiLcRZ7hwZ-NsM-xgSAqSJGCis9RH9oqtaA2HZR3C_uq7F6_YCksGdCu5D2_hnbTzCCRTeuZAT-fimA827ELeqQvYi1ed0WfdF4Or25CrzJIPzZbZLTtmyHUNiZ0trg5HUM-AQRmDUmEAdxBReT9QmNelBQl0oQ8qFEepXy-GcDzJ1km" />
                        <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a smiling man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpwZ1YmYd23O93bVYUqoSR_mvQBg7tT1CpqwHcs5_WObRS0G34tkoP0p_lWI5yDVmp06gnfnDFmFhNmxxVKR9FQo5l6SK1C1UQieFpbH7xRgubMiBi7IBfshylUs7ZxO9mQMUh-0QF96Mn-rIaJTzpQcKB-LHZQ-Jr58BuC76pHUaQooalXKIoiqs2W1Z4seRIDqOEnyJtb1gHDwDzsV0yQA2iowIvg-XB3FHpjBw0fJOF9jVPIVLVbBUvEfV_MyuHrnMgCnbJoKxx" />
                        <img alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark object-cover" data-alt="Small avatar of a man with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBby20m6NC13AG-73MAHrKRHwvnQ2gn6Lz3rEdgSumLD6CxmBu-1cYodKPSqCvqt5HbzkAdDlIV7nGZiChqr0-VegEOuWc06Sb-nGkRdK2gBqXcjcnNlekle7qUhS5qqS6N1cYTmm0ldhGKS80LHEkbUj0zew-Fb-Ho7CLy1MVCq1G4xh0I1D0wHyowzvCRoZhpVaLX7pQmZMV4o2qss4FKRlKoMls6bfQ3SFManD9En3M1WdwlhY2vW_M2BALJYCJdw59wC3XBqn5U" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        0 / {formValues.capacity || 100} going
                    </span>
                </div>
            </div>


        </div>
    );
}
