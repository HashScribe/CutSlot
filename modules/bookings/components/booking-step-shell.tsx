import { CalendarDays, Scissors, UserRound, UserRoundPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { label: "Service", icon: Scissors },
  { label: "Staff", icon: UserRound },
  { label: "Date & time", icon: CalendarDays },
  { label: "Details", icon: UserRoundPlus }
];

export function BookingStepShell({ salonSlug }: { salonSlug: string }) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C8A97E]">{salonSlug}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal">Book an appointment</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.label} className="border-[#E7DED2] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <step.icon className="h-4 w-4 text-[#C8A97E]" aria-hidden="true" />
                {index + 1}. {step.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Interactive booking controls will live inside the bookings feature module.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
