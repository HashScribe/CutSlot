export function PublicSalonHero({ salonSlug }: { salonSlug: string }) {
  return (
    <section className="mx-auto grid min-h-[70vh] w-full max-w-5xl content-center gap-6 px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C8A97E]">{salonSlug}</p>
      <div className="max-w-3xl space-y-5">
        <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">Book your next salon visit in seconds.</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600">
          A clean tenant-branded public page will show real services, staff, dates, and available slots once the booking engine is connected.
        </p>
      </div>
    </section>
  );
}
