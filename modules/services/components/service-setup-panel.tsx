import { Clock, Scissors } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/modules/services/lib/types";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "@/modules/services/lib/actions";

function priceValue(priceCents?: number | null) {
  if (priceCents == null) return "";
  return String(priceCents / 100);
}

export function ServiceSetupPanel({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-primary" aria-hidden="true" />
            Add service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createServiceAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-service-name">Name</label>
              <Input id="new-service-name" name="name" placeholder="Haircut" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-service-description">Description</label>
              <Textarea id="new-service-description" name="description" placeholder="Short public description" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="new-service-duration">Duration</label>
                <Input id="new-service-duration" min="1" name="durationMinutes" type="number" defaultValue="45" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="new-service-buffer">Buffer</label>
                <Input id="new-service-buffer" min="0" name="bufferMinutes" type="number" defaultValue="10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="new-service-price">Price</label>
                <Input id="new-service-price" min="0" name="price" step="0.01" type="number" placeholder="0" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="h-4 w-4 accent-primary" name="isActive" type="checkbox" defaultChecked />
              Active
            </label>
            <SubmitButton className="w-full">Create service</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="font-medium">No services yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create the first bookable service to unlock staff assignment and availability.</p>
            </CardContent>
          </Card>
        ) : null}

        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{service.name}</span>
                <Badge variant={service.isActive ? "success" : "muted"}>{service.isActive ? "Active" : "Hidden"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateServiceAction} className="space-y-4">
                <input name="serviceId" type="hidden" value={service.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor={`service-${service.id}-name`}>Name</label>
                    <Input id={`service-${service.id}-name`} name="name" defaultValue={service.name} required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`service-${service.id}-duration`}>Duration</label>
                      <Input id={`service-${service.id}-duration`} min="1" name="durationMinutes" type="number" defaultValue={service.durationMinutes} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`service-${service.id}-buffer`}>Buffer</label>
                      <Input id={`service-${service.id}-buffer`} min="0" name="bufferMinutes" type="number" defaultValue={service.bufferMinutes} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`service-${service.id}-price`}>Price</label>
                      <Input id={`service-${service.id}-price`} min="0" name="price" step="0.01" type="number" defaultValue={priceValue(service.priceCents)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor={`service-${service.id}-description`}>Description</label>
                  <Textarea id={`service-${service.id}-description`} name="description" defaultValue={service.description ?? ""} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input className="h-4 w-4 accent-primary" name="isActive" type="checkbox" defaultChecked={service.isActive} />
                    Active on public booking
                  </label>
                  <div className="flex gap-2">
                    <SubmitButton variant="secondary">Save</SubmitButton>
                  </div>
                </div>
              </form>
              <form action={deleteServiceAction} className="mt-3 flex justify-end">
                <input name="serviceId" type="hidden" value={service.id} />
                <SubmitButton pendingLabel="Deleting..." variant="destructive">Delete</SubmitButton>
              </form>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {service.durationMinutes} min service · {service.bufferMinutes} min buffer
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
