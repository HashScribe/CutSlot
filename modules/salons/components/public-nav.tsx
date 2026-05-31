import Link from "next/link";
import { Scissors } from "lucide-react";

export function PublicNav({
  accentColor,
  logoUrl,
  salonName,
  salonSlug
}: {
  accentColor: string;
  logoUrl?: string | null;
  salonName: string;
  salonSlug: string;
}) {
  return (
    <header className="border-b border-white/10 bg-[#0F1115]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <Link className="flex min-w-0 items-center gap-3" href={`/${salonSlug}`}>
          {logoUrl ? (
            <img
              alt={`${salonName} logo`}
              className="h-10 w-10 rounded-md border border-white/10 object-cover"
              src={logoUrl}
            />
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold text-[#111827]"
              style={{ backgroundColor: accentColor }}
            >
              {salonName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-semibold tracking-normal text-white">{salonName}</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            href={`/${salonSlug}/services`}
          >
            <Scissors className="h-4 w-4" aria-hidden="true" />
            Services
          </Link>
        </nav>
      </div>
    </header>
  );
}
