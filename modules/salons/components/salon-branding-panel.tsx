import Link from "next/link";
import { Clock, Palette } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Salon } from "@/modules/salons/lib/types";
import { updateSalonAction } from "@/modules/salons/lib/actions";
import { type WorkingHour } from "@/modules/salons/lib/working-hours";
import { WorkingHoursForm } from "@/modules/salons/components/working-hours-form";

export function SalonBrandingPanel({
  salon,
  workingHours
}: {
  salon: Salon;
  workingHours: WorkingHour[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
            Salon profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 rounded-lg border border-border bg-secondary/20 p-4">
            <p className="text-sm font-medium">Brand preview</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {salon.logoUrl ? (
                <img
                  alt={`${salon.name} logo`}
                  className="h-12 w-12 rounded-md border border-border object-cover"
                  src={salon.logoUrl}
                />
              ) : (
                <span className="h-12 w-12 rounded-md border border-border" style={{ backgroundColor: salon.accentColor }} />
              )}
              <div>
                <p className="font-semibold">{salon.name}</p>
                <p className="text-sm text-muted-foreground">/{salon.slug} · {salon.themeMode} public theme</p>
              </div>
            </div>
          </div>
          <form action={updateSalonAction} className="space-y-4">
            <input name="salonId" type="hidden" value={salon.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="salon-name">Name</label>
                <Input id="salon-name" name="name" defaultValue={salon.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="salon-slug">Public slug</label>
                <Input id="salon-slug" name="slug" defaultValue={salon.slug} pattern="[a-z0-9-]+" required />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="salon-phone">Phone</label>
                <Input id="salon-phone" name="phone" defaultValue={salon.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="salon-accent">Accent</label>
                <Input id="salon-accent" name="accentColor" type="color" defaultValue={salon.accentColor} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="salon-address">Address</label>
              <Textarea id="salon-address" name="address" defaultValue={salon.address ?? ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="salon-logo">Logo URL</label>
              <Input
                id="salon-logo"
                name="logoUrl"
                placeholder="https://example.com/logo.png"
                type="url"
                defaultValue={salon.logoUrl ?? ""}
              />
              <p className="text-xs text-muted-foreground">Use a public image URL for now. Supabase Storage upload comes next.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="salon-theme">Public theme</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={salon.themeMode}
                id="salon-theme"
                name="themeMode"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slot-interval">Slot interval</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={salon.slotIntervalMinutes}
                id="slot-interval"
                name="slotIntervalMinutes"
              >
                {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    Every {minutes} minutes
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Availability slots will be generated using this interval.</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" type="button">
                <Link href={`/${salon.slug}`}>View public page</Link>
              </Button>
              <SubmitButton>Save profile</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            Working hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WorkingHoursForm salonId={salon.id} workingHours={workingHours} />
        </CardContent>
      </Card>
    </div>
  );
}
