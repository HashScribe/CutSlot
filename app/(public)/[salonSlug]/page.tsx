import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PublicSalonHero } from "@/modules/salons/components/public-salon-hero";

export default async function PublicSalonPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#111827]">
      <PublicSalonHero salonSlug={salonSlug} />
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-12 md:flex-row">
        <Link className={buttonVariants({ className: "bg-[#111827] text-white hover:bg-[#111827]/90" })} href={`/${salonSlug}/book`}>
          Book appointment
        </Link>
      </section>
    </main>
  );
}
