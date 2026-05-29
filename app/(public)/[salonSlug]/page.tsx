import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PublicSalonHero } from "@/modules/salons/components/public-salon-hero";
import { getSalonBySlug } from "@/modules/salons/lib/queries";

export default async function PublicSalonPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const salon = await getSalonBySlug(salonSlug);
  const accentColor = salon?.accentColor ?? "#C8A97E";
  const isDark = salon?.themeMode === "dark";

  return (
    <main className={isDark ? "min-h-screen bg-[#0F1115] text-[#F5F7FA]" : "min-h-screen bg-[#FAF7F2] text-[#111827]"}>
      <PublicSalonHero
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-12 md:flex-row">
        <Link
          className={buttonVariants({ className: "text-white hover:opacity-90" })}
          href={`/${salonSlug}/book`}
          style={{ backgroundColor: accentColor }}
        >
          Book appointment
        </Link>
      </section>
    </main>
  );
}
