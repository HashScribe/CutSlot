import { CalendarDays, Scissors, UserRound, UserRoundPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { label: "Service", icon: Scissors },
  { label: "Staff", icon: UserRound },
  { label: "Date & time", icon: CalendarDays },
  { label: "Details", icon: UserRoundPlus }
];

export function BookingStepShell({
  accentColor,
  isDark,
  logoUrl,
  salonName,
  salonSlug
}: {
  accentColor: string;
  isDark: boolean;
  logoUrl?: string | null;
  salonName: string;
  salonSlug: string;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <p className="text-sm font-medium uppercase tracking-[0.24em]" style={{ color: accentColor }}>
        {salonSlug}
      </p>
      <div className="mt-3 flex items-center gap-3">
        {logoUrl ? (
          <img
            alt={`${salonName} logo`}
            className={isDark ? "h-12 w-12 rounded-lg border border-white/10 object-cover" : "h-12 w-12 rounded-lg border border-[#E7DED2] object-cover"}
            src={logoUrl}
          />
        ) : null}
        <h1 className="text-3xl font-semibold tracking-normal">Book {salonName}</h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.label} className={isDark ? "border-white/10 bg-white/5" : "border-[#E7DED2] bg-white"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <step.icon className="h-4 w-4" style={{ color: accentColor }} aria-hidden="true" />
                {index + 1}. {step.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={isDark ? "text-sm text-white/60" : "text-sm text-gray-600"}>
                Interactive booking controls will live inside the bookings feature module.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
