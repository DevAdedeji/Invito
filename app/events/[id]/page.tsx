
"use client";

import { useParams } from "next/navigation";
import { useEvent } from "@/hooks/useEvents";
import { format } from "date-fns";
import { Calendar, MapPin, CheckCircle2, XCircle, HelpCircle, ArrowRight, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/app/hooks/use-toast";

export default function PublicEventPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { data: event, isLoading } = useEvent(eventId);
    const { toast } = useToast();

    const [status, setStatus] = useState<"attending" | "not_attending" | "maybe">("attending");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            toast({
                title: "Missing Information",
                description: "Please enter your name and email to RSVP.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Add guest to subcollection
            await addDoc(collection(db, "events", eventId, "guests"), {
                name,
                email,
                status,
                role: "Guest",
                guests: 0, // Default 0 extra guests for now
                rsvpDate: new Date().toISOString(),
            });

            // Increment attendee count if attending
            if (status === 'attending') {
                const eventRef = doc(db, "events", eventId);
                await updateDoc(eventRef, {
                    attendees: increment(1)
                });
            }

            setIsSubmitted(true);
            toast({
                title: "RSVP Confirmed!",
                description: status === 'attending' ? "We look forward to seeing you there!" : "Thank you for letting us know.",
            });
        } catch (error) {
            console.error("Error submitting RSVP:", error);
            toast({
                title: "Error",
                description: "Failed to submit RSVP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a0b2e]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a0b2e] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
                    <p className="text-gray-400">This event link may be invalid or expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header / Hero Section */}
            <div className="relative bg-[#1a0b2e] text-white pt-12 pb-32 px-6 text-center overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2"></div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="mb-8">
                        {/* Logo / Brand Placeholder */}
                        <div className="flex justify-center items-center gap-2 mb-8 opacity-90">
                            <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-xs font-bold">I</div>
                            <span className="text-sm font-bold tracking-widest uppercase">Invito Events</span>
                        </div>

                        <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase mb-6 text-purple-200">
                            Exclusive Invitation
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <p className="text-lg text-purple-100/80 leading-relaxed max-w-xl mx-auto">
                            You are cordially invited to join us for this special occasion.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section - Overlapping Cards */}
            <div className="flex-grow px-4 pb-16 -mt-20 relative z-20">
                <div className="max-w-xl mx-auto space-y-6">

                    {/* Event Details Card */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="bg-white p-6 md:p-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                            {format(new Date(event.date), "EEEE, MMMM do")}
                                        </h3>
                                        <p className="text-gray-500">
                                            {format(new Date(event.date), "h:mm a")} – {format(new Date(new Date(event.date).getTime() + 4 * 60 * 60 * 1000), "h:mm a")} EST
                                        </p>
                                        <div className="mt-2 flex items-center text-xs font-medium text-purple-600 cursor-pointer hover:underline">
                                            <span>Add to Calendar</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full"></div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        {/* @ts-ignore */}
                                        {event.locationType === 'online' ? <LinkIcon className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                            {/* @ts-ignore */}
                                            {event.locationType === 'online' ? "Online Event" : event.location}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            {/* @ts-ignore */}
                                            {event.locationType === 'online' ? "Join via the link below" : "See map for directions"}
                                        </p>

                                        {/* Simple Map Placeholder or Link Button */}
                                        {/* @ts-ignore */}
                                        {event.locationType === 'online' ? (
                                            <a href={event.location} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg transition-colors">
                                                <LinkIcon className="w-3 h-3 mr-2" />
                                                Join Event
                                            </a>
                                        ) : (
                                            <div className="mt-4 rounded-xl overflow-hidden h-32 bg-gray-100 relative group cursor-pointer border border-gray-100">
                                                {/* Map Pattern / Image */}
                                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-74.006,40.7128,13,0/600x200@2x?access_token=YOUR_TOKEN')] bg-cover bg-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white shadow-sm px-4 py-2 rounded-full text-xs font-bold text-gray-800 flex items-center gap-2 group-hover:scale-105 transition-transform">
                                                        <MapPin className="w-3 h-3 text-purple-600" />
                                                        View Map
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RSVP Form Card */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                        <CardContent className="p-6 md:p-8 bg-white">
                            {isSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-300">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Response Sent!</h3>
                                    <p className="text-gray-500">
                                        {status === 'attending'
                                            ? "You're on the list! We've sent a confirmation email to " + email
                                            : "Thank you for letting us know."}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Will you be joining us?</h2>

                                        <RadioGroup value={status} onValueChange={(val: any) => setStatus(val)} className="space-y-3">
                                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${status === 'attending' ? 'border-purple-600 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setStatus('attending')}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'attending' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                                                        {status === 'attending' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`font-semibold ${status === 'attending' ? 'text-purple-900' : 'text-gray-700'}`}>Joyfully Accept</span>
                                                </div>
                                                {status === 'attending' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                                            </div>

                                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${status === 'not_attending' ? 'border-gray-400 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setStatus('not_attending')}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'not_attending' ? 'border-gray-500 bg-gray-500' : 'border-gray-300'}`}>
                                                        {status === 'not_attending' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`font-medium ${status === 'not_attending' ? 'text-gray-900' : 'text-gray-700'}`}>Regretfully Decline</span>
                                                </div>
                                                {status === 'not_attending' && <XCircle className="w-5 h-5 text-gray-400" />}
                                            </div>

                                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${status === 'maybe' ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`} onClick={() => setStatus('maybe')}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'maybe' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                                        {status === 'maybe' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`font-medium ${status === 'maybe' ? 'text-orange-900' : 'text-gray-700'}`}>Hope to make it</span>
                                                </div>
                                                {status === 'maybe' && <HelpCircle className="w-5 h-5 text-orange-400" />}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Jane Doe"
                                                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-11"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="e.g. jane@example.com"
                                                className="bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-11"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-bold bg-[#4a1d96] hover:bg-[#3b1778] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            <>
                                                Confirm RSVP
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        By clicking confirm, you agree to our Event Terms.
                                    </p>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-gray-400 text-sm">
                <div className="flex justify-center gap-6 mb-4">
                    <span>Questions? Contact the host</span>
                </div>
                <p>Powered by <span className="font-bold text-gray-600">Invito™</span></p>
            </div>
        </div>
    );
}
