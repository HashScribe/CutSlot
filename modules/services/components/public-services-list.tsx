import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Clock3, Scissors } from "lucide-react";
import type { Service } from "@/modules/services/lib/types";

function formatPrice(priceCents?: number | null) {
  if (priceCents == null) return "Price varies";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0
  }).format(priceCents / 100);
}

export function PublicServicesList({
  accentColor,
  salonSlug,
  services,
  showAllServicesLink = false
}: {
  accentColor: string;
  salonSlug: string;
  services: Service[];
  showAllServicesLink?: boolean;
}) {
  return (
    <section
      className="tenant-accent-scope mx-auto w-full max-w-6xl px-4 py-14 md:py-16"
      style={{ "--tenant-accent": accentColor } as CSSProperties}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            Menu
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white md:text-4xl">Choose your visit</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Select the service that fits your plan. Each service opens booking with that choice already selected.
          </p>
        </div>
        {showAllServicesLink ? (
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white" href={`/${salonSlug}/services`}>
            Explore all services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {services.length === 0 ? (
        <div className="mt-8 rounded-md border border-white/10 bg-white/[0.04] p-6 text-white">
          <Scissors className="h-5 w-5" style={{ color: accentColor }} aria-hidden="true" />
          <p className="mt-4 font-medium">No bookable services yet</p>
          <p className="mt-2 text-sm text-white/60">This salon is still preparing its service menu.</p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/${salonSlug}/book?serviceId=${encodeURIComponent(service.id)}`}
            className="tenant-option group relative overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-5 text-white shadow-2xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-4 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-16" style={{ backgroundColor: accentColor }} />
                <h3 className="text-lg font-semibold tracking-normal">{service.name}</h3>
                {service.description ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">{service.description}</p>
                ) : null}
              </div>
              <p className="shrink-0 rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm font-medium text-white">
                {formatPrice(service.priceCents)}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {service.durationMinutes} minutes
              </span>
              <span>{service.bufferMinutes} minute buffer</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium transition group-hover:translate-x-0.5" style={{ color: accentColor }}>
              Choose this service
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
