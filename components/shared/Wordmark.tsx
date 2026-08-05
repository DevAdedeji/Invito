import { cn } from "@/lib/utils";

export default function Wordmark({ className }: { className?: string }) {
    return (
        <span className={cn("flex items-baseline gap-2", className)}>
            <span className="font-display text-ink text-2xl leading-none">Invito</span>
            <span className="bg-seal mb-1 size-1 rounded-full" aria-hidden />
        </span>
    );
}
