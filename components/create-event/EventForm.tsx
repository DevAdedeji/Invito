"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/create-event/ImageUpload";
import { QuestionBuilder } from "@/components/create-event/QuestionBuilder";
import { supportedTimeZones } from "@/lib/datetime";
import { EVENT_TYPES, type EventFormValues } from "@/lib/event-form";
import { cn } from "@/lib/utils";

interface EventFormProps {
    form: UseFormReturn<EventFormValues>;
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-rule border-t pt-10">
            <p className="eyebrow eyebrow-left">{title}</p>
            {description && (
                <p className="text-ink-muted mt-4 text-sm">{description}</p>
            )}
            <div className="mt-7 space-y-6">{children}</div>
        </section>
    );
}

function DateField({
    form,
    name,
    label,
}: {
    form: UseFormReturn<EventFormValues>;
    name: "startDate" | "endDate";
    label: string;
}) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    type="button"
                                    variant="subtle"
                                    className={cn(
                                        "w-full justify-between font-sans text-sm normal-case tracking-normal",
                                        !field.value && "text-ink-faint"
                                    )}
                                >
                                    {field.value
                                        ? format(field.value, "EEE, d MMM yyyy")
                                        : "Pick a date"}
                                    <CalendarIcon className="opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                autoFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function EventForm({ form }: EventFormProps) {
    const timeZones = useMemo(() => supportedTimeZones(), []);
    const locationType = form.watch("locationType");
    const allowPlusOnes = form.watch("allowPlusOnes");
    const capacity = form.watch("capacity");
    const description = form.watch("description");

    return (
        <div className="space-y-12">
            <section>
                <p className="eyebrow eyebrow-left">The cover</p>
                <div className="mt-7">
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
            </section>

            <Section title="The basics">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event name</FormLabel>
                            <FormControl>
                                <Input placeholder="Supper on the Terrace" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="hostName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hosted by</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ada Obi" {...field} />
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
                                <FormLabel>Occasion</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {EVENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What should guests know?</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={6}
                                    placeholder="Dinner on the terrace, then dancing. Come hungry."
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-right">
                                {description?.length ?? 0} / 2500
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Section>

            <Section title="When">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex gap-3">
                        <DateField form={form} name="startDate" label="Starts" />
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem className="w-28">
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-3">
                        <DateField form={form} name="endDate" label="Ends" />
                        <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem className="w-28">
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-72">
                                    {timeZones.map((zone) => (
                                        <SelectItem key={zone} value={zone}>
                                            {zone.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Guests always see the time you entered, wherever they are.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Section>

            <Section title="Where">
                <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kind of gathering</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="physical">In person</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {locationType === "online" ? "Meeting link" : "Address"}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={
                                        locationType === "online"
                                            ? "https://meet.google.com/…"
                                            : "12 Marina, Lagos"
                                    }
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Section>

            <Section
                title="Replies"
                description="How many people you can take, and what you want to ask them."
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={field.value}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Leave at 0 for no limit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {capacity > 0 && (
                        <FormField
                            control={form.control}
                            name="waitlistEnabled"
                            render={({ field }) => (
                                <FormItem className="border-rule flex items-center justify-between gap-4 border p-4 sm:mt-7">
                                    <div>
                                        <FormLabel>Waitlist</FormLabel>
                                        <FormDescription className="mt-1.5">
                                            Queue replies once you are full.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="allowPlusOnes"
                        render={({ field }) => (
                            <FormItem className="border-rule flex items-center justify-between gap-4 border p-4">
                                <div>
                                    <FormLabel>Allow plus-ones</FormLabel>
                                    <FormDescription className="mt-1.5">
                                        Let guests bring people.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {allowPlusOnes && (
                        <FormField
                            control={form.control}
                            name="maxPlusOnes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maximum per guest</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(Number(e.target.value))
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="customQuestions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Extra questions</FormLabel>
                            <FormControl>
                                <div className="pt-2">
                                    <QuestionBuilder
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </Section>

            <Section
                title="On the page"
                description="Optional sections guests see on the invitation."
            >
                {(
                    [
                        {
                            name: "guestListPublic",
                            label: "Show who's coming",
                            hint: "First names only — never email addresses.",
                        },
                        {
                            name: "discussionEnabled",
                            label: "Note wall",
                            hint: "Guests can leave short messages.",
                        },
                        {
                            name: "galleryEnabled",
                            label: "Photo gallery",
                            hint: "Guests can add photos.",
                        },
                    ] as const
                ).map((toggle) => (
                    <FormField
                        key={toggle.name}
                        control={form.control}
                        name={toggle.name}
                        render={({ field }) => (
                            <FormItem className="border-rule flex items-center justify-between gap-4 border p-4">
                                <div>
                                    <FormLabel>{toggle.label}</FormLabel>
                                    <FormDescription className="mt-1.5">
                                        {toggle.hint}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </Section>
        </div>
    );
}
