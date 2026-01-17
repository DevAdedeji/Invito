
"use client";

import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/create-event/ImageUpload";
import { EventFormValues } from "@/app/dashboard/create-event/page";

interface EventFormProps {
    form: UseFormReturn<EventFormValues>;
}

export function EventForm({ form }: EventFormProps) {
    return (
        <>
            <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">Event Cover</h2>
                    <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        Recommended
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">Basic Info</h2>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Summer Solstice Rooftop Party" {...field} className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl h-12" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="hostName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Host Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name or Organization" {...field} className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl h-12" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus:ring-violet-500 rounded-xl h-12">
                                            <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="social">Social Gathering</SelectItem>
                                        <SelectItem value="conference">Conference</SelectItem>
                                        <SelectItem value="workshop">Workshop</SelectItem>
                                        <SelectItem value="concert">Concert</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">Date & Location</h2>
                    {/* Virtual Event Toggle could go here */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormLabel>Start Date & Time</FormLabel>
                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full bg-gray-50 dark:bg-zinc-800/50 border-0 pl-3 text-left font-normal rounded-xl h-12",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "MM/dd/yyyy")
                                                        ) : (
                                                            <span>Pick date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormControl>
                                            <Input type="time" {...field} className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormLabel>End Date & Time</FormLabel>
                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full bg-gray-50 dark:bg-zinc-800/50 border-0 pl-3 text-left font-normal rounded-xl h-12",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "MM/dd/yyyy")
                                                        ) : (
                                                            <span>Pick date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormControl>
                                            <Input type="time" {...field} className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input placeholder="Search for a venue or address" {...field} className="pl-10 bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl h-12" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">About the Event</h2>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Tell your guests what to expect..."
                                        {...field}
                                        className="bg-gray-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-violet-500 rounded-xl min-h-[150px] resize-none p-4"
                                    />
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                                        {field.value?.length || 0}/2500
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end p-4">
                <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Creating..." : "Create Event"}
                </Button>
            </div>
        </>
    );
}
