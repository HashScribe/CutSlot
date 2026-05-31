import Link from "next/link";
import { CalendarDays, MapPin, Phone, Scissors } from "lucide-react";

export function PublicFooter({
  accentColor,
  address,
  logoUrl,
  phone,
  salonName,
  salonSlug
}: {
  accentColor: string;
  address?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  salonName: string;
  salonSlug: string;
}) {
  return (
    <footer className="border-t border-white/10 bg-[#0C0E12]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
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
            <span className="truncate text-sm font-semibold text-white">{salonName}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
            Premium appointments, curated services, and live booking availability.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Visit</p>
          <div className="mt-4 space-y-3 text-sm text-white/60">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accentColor }} aria-hidden="true" />
              <span>{address || "Salon location"}</span>
            </p>
            {phone ? (
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" style={{ color: accentColor }} aria-hidden="true" />
                <span>{phone}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Links</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link className="inline-flex items-center gap-2 text-white/60 transition hover:text-white" href={`/${salonSlug}/services`}>
              <Scissors className="h-4 w-4" aria-hidden="true" />
              Services
            </Link>
            <Link className="inline-flex items-center gap-2 text-white/60 transition hover:text-white" href={`/${salonSlug}/book`}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Book appointment
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/40">
          <span>{salonName}</span>
          <span>Powered by CutSlot</span>
        </div>
      </div>
    </footer>
  );
}
