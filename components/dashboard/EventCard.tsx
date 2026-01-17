
import { Event } from "@/hooks/useEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ChevronRight } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

export default function EventCard({ event }: { event: Event }) {
    return (
        <Card className="overflow-hidden border-none shadow-soft hover:shadow-hover transition-all duration-300 group cursor-pointer h-full flex flex-col !pt-0">
            <div className="relative h-48 w-full bg-muted">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground/30">
                        No Image
                    </div>
                )}
                {/* <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-bold shadow-sm uppercase tracking-wider text-primary">
                        Featured
                    </Badge>
                </div> */}
            </div>

            <CardContent className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                    <span>{format(new Date(event.date), "MMM dd, yyyy • p")}</span>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between items-end">
                        <div>
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {event.status === 'active' ? 'Attending' : event.status === 'draft' ? 'Pending' : 'Capacity'}
                            </h4>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-foreground">{event.attendees}</span>
                                <span className="text-xs text-muted-foreground">/ {event.capacity}</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
