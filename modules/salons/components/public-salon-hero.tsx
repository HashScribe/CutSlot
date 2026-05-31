import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, Scissors } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const heroImageUrl =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=85";

export function PublicSalonHero({
  address,
  accentColor,
  logoUrl,
  salonName,
  salonSlug,
  serviceCount
}: {
  address?: string | null;
  accentColor: string;
  logoUrl?: string | null;
  salonName: string;
  salonSlug: string;
  serviceCount: number;
}) {
  return (
    <section
      className="relative isolate flex min-h-[82svh] items-end overflow-hidden border-b border-white/10 bg-[#0F1115]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(15,17,21,0.96) 0%, rgba(15,17,21,0.78) 48%, rgba(15,17,21,0.42) 100%), url(${heroImageUrl})`,
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-12 pt-10 md:pb-16">
        <div className="max-w-3xl">
          <div className="animate-fade-up flex items-center gap-3">
            {logoUrl ? (
              <img
                alt={`${salonName} logo`}
                className="h-14 w-14 rounded-md border border-white/15 bg-white/10 object-cover shadow-xl"
                src={logoUrl}
              />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-md text-lg font-semibold text-[#111827] shadow-xl"
                style={{ backgroundColor: accentColor }}
              >
                {salonName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/50">{salonSlug}</p>
              <p className="mt-1 truncate text-sm text-white/70">Private appointment studio</p>
            </div>
          </div>

          <h1 className="animate-fade-up-delay-1 mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-white md:text-7xl">
            {salonName}
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
            A polished salon experience with calm scheduling, clear service choices, and appointment times that fit your day.
          </p>

          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              className={buttonVariants({
                className: "h-11 px-5 text-[#111827] shadow-xl shadow-black/25 hover:translate-y-[-1px] hover:opacity-95"
              })}
              href={`/${salonSlug}/book`}
              style={{ backgroundColor: accentColor }}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Book appointment
            </Link>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
              href={`/${salonSlug}/services`}
            >
              View services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="animate-fade-up-delay-3 grid gap-3 border-y border-white/10 py-4 text-sm text-white/70 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <Scissors className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
            </span>
            <span>{serviceCount > 0 ? `${serviceCount} curated services` : "Curated services"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <Clock3 className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
            </span>
            <span>Live appointment times</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <MapPin className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
            </span>
            <span className="truncate">{address || "Salon location"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
