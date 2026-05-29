export function PublicSalonHero({
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
    <section className="mx-auto grid min-h-[70vh] w-full max-w-5xl content-center gap-6 px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: accentColor }}>
        {salonSlug}
      </p>
      {logoUrl ? (
        <img
          alt={`${salonName} logo`}
          className="h-20 w-20 rounded-lg border border-black/10 bg-white object-cover shadow-sm"
          src={logoUrl}
        />
      ) : null}
      <div className="max-w-3xl space-y-5">
        <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">{salonName}</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600">
          Book your next salon visit in seconds with a clean tenant-branded appointment experience.
        </p>
      </div>
    </section>
  );
}
