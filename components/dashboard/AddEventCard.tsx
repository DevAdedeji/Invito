

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AddEventCard() {
    return (
        <Card className="border-2 border-dashed border-muted hover:border-primary/50 bg-transparent shadow-none hover:bg-muted/10 transition-all duration-300 h-full cursor-pointer group flex flex-col justify-center items-center text-center p-6 min-h-[350px]">

            <CardContent className="flex flex-col items-center justify-center p-0">
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Add New Event</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mb-6">
                    Ready to host something new? Get started here.
                </p>
                <Link href="/dashboard/create-event">
                    <Button variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                        Create New
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
