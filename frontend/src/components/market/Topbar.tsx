"use client";

interface TopbarProps {
    show?: boolean;
    phone?: string;
    sameDayNote?: string;
    taxNote?: string;
}

export function Topbar({
    show,
    phone = "0850 440 11 22",
    sameDayNote = "14:00'a kadar aynı gün kargoda",
    taxNote = "KDV hariç bayi fiyatları",
}: TopbarProps) {
    if (show === false) return null;

    return (
        <div className="bg-primary-900 h-10 hidden md:flex items-center">
            <div className="max-w-[1300px] mx-auto px-7 w-full flex items-center justify-between text-[13px] font-semibold text-white">
                {/* Left — value props with yellow dot bullets */}
                <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                        {sameDayNote}
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                        {taxNote}
                    </span>
                </div>

                {/* Right — B2B hotline */}
                <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="font-bold tabular-num hover:text-accent-500 transition-colors"
                >
                    B2B: {phone}
                </a>
            </div>
        </div>
    );
}
