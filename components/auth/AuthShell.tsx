export default function AuthShell({
    eyebrow,
    title,
    subtitle,
    children,
    footer,
}: {
    eyebrow: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}) {
    return (
        <div className="w-full max-w-sm">
            <div className="text-center">
                <p className="eyebrow justify-center">{eyebrow}</p>
                <h1 className="font-display mt-6 text-4xl">{title}</h1>
                <p className="text-ink-muted mt-3 text-sm leading-relaxed">
                    {subtitle}
                </p>
            </div>

            <div className="mt-10">{children}</div>

            <div className="text-ink-muted mt-8 text-center text-sm">{footer}</div>
        </div>
    );
}
