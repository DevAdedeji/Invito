
"use client";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useEvent, useGuests } from "@/hooks/useEvents";
import { format } from "date-fns";
import {
    Calendar,
    MapPin,
    Share2,
    Edit,
    Download,
    Search,
    Filter,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { data: event, isLoading: isLoadingEvent } = useEvent(eventId);
    const { data: guests, isLoading: isLoadingGuests } = useGuests(eventId);

    const isLoading = isLoadingEvent || isLoadingGuests;

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    // Calculate Stats from Real Data
    const guestList = guests || [];
    const stats = {
        attending: guestList.filter(g => g.status === 'attending').length,
        notAttending: guestList.filter(g => g.status === 'not_attending').length,
        maybe: guestList.filter(g => g.status === 'maybe').length
    };

    // Filter Logic
    const filteredGuests = guestList.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || guest.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    const currentGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'attending': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300';
            case 'not_attending': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'maybe': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/events/${eventId}`;
        navigator.clipboard.writeText(url);
        toast.success("Event link copied to clipboard!");
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 space-y-8">
                <Skeleton className="h-8 w-1/3 bg-primary opacity-20" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-32 bg-primary opacity-20" /><Skeleton className="h-32 bg-primary opacity-20" /><Skeleton className="h-32 bg-primary opacity-20" /><Skeleton className="h-32 bg-primary opacity-20" />
                </div>
                <Skeleton className="h-64 bg-primary opacity-20" />
            </div>
        );
    }

    if (!event) {
        return <div className="p-8 text-center">Event not found</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <span>&gt;</span>
                        <span className="text-foreground font-medium">{event.title}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">{event.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span>{format(new Date(event.date), "p")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* @ts-ignore - checking custom field that might exist now */}
                            {event.locationType === 'online' ? <LinkIcon className="w-4 h-4 text-violet-500" /> : <MapPin className="w-4 h-4 text-violet-500" />}
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    {/* User requested to remove Edit button */}
                    <Button
                        className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                        Share Event
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* User requested to remove Total Invited card */}

                <Card className="shadow-soft hover:shadow-md transition-shadow">
                    <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-violet-500 rounded-full"></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Attending</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400">{stats.attending}</h3>
                                <span className="text-xs text-muted-foreground">Guests</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-soft hover:shadow-md transition-shadow border-l-4 border-l-red-200 dark:border-l-red-900/50">
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Not Attending</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.notAttending}</h3>
                                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100 px-1 py-0 h-5">
                                    High decline rate
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-soft hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Maybe</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.maybe}</h3>
                                <span className="text-xs text-muted-foreground">Pending</span>
                            </div>
                            {/* <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                                <div className="bg-orange-400 h-full w-[40%] rounded-full"></div>
                            </div> */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Controls */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guests by name or email..."
                            className="pl-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <div className="flex items-center text-muted-foreground">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="attending">Attending</SelectItem>
                                <SelectItem value="not_attending">Not Attending</SelectItem>
                                <SelectItem value="maybe">Maybe</SelectItem>
                                <SelectItem value="invited">Invited</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 dark:bg-zinc-900/50 hover:bg-gray-50/50">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>GUEST NAME</TableHead>
                                <TableHead>CONTACT INFO</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead>GUESTS</TableHead>
                                <TableHead>RSVP DATE</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentGuests.length > 0 ? (
                                currentGuests.map((guest) => (
                                    <TableRow key={guest.id} className="group">
                                        <TableCell>
                                            <div className="w-2 h-2 rounded-full border border-gray-300"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-gray-100">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${guest.name}`} />
                                                    <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{guest.name}</div>
                                                    <div className="text-xs text-muted-foreground">{guest.role}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm space-y-0.5">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <span className="text-xs">✉</span> {guest.email}
                                                </div>
                                                {guest.phone && (
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                        <span>📞</span> {guest.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`font-normal capitalize ${getStatusColor(guest.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70"></span>
                                                {guest.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {guest.status === 'not_attending' ? '-' : (guest.guests === 0 ? '0' : guest.guests)}
                                            </span>
                                            {guest.guests > 0 && <span className="text-xs text-muted-foreground ml-1">+{guest.guests} Guest</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {format(new Date(guest.rsvpDate), "MMM dd, yyyy")}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {format(new Date(guest.rsvpDate), "p")}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Users className="w-12 h-12 text-gray-200" />
                                            <p className="text-lg font-medium text-gray-500">No guests yet</p>
                                            <p className="text-sm text-gray-400">Share your event to start getting RSVPs!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-zinc-800">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{filteredGuests.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredGuests.length)}</span> of <span className="font-medium text-foreground">{filteredGuests.length}</span> guests
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg disabled:opacity-50"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || filteredGuests.length === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="rounded-lg bg-violet-600 hover:bg-violet-700"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages || filteredGuests.length === 0}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
