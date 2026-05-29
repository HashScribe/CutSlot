import { UserRoundCheck } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createStaffAction, deleteStaffAction, updateStaffAction } from "@/modules/staff/lib/actions";
import type { StaffMember, StaffService } from "@/modules/staff/lib/types";
import type { Service } from "@/modules/services/lib/types";

function assignedServiceIds(staffId: string, assignments: StaffService[]) {
  return new Set(assignments.filter((item) => item.staffId === staffId).map((item) => item.serviceId));
}

function ServiceCheckboxes({
  services,
  selectedIds
}: {
  services: Service[];
  selectedIds?: Set<string>;
}) {
  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">Create services before assigning them to staff.</p>;
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {services.map((service) => (
        <label key={service.id} className="flex items-center gap-2 rounded-md border border-border bg-secondary/20 p-2 text-sm">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked={selectedIds?.has(service.id)}
            name="serviceIds"
            type="checkbox"
            value={service.id}
          />
          {service.name}
        </label>
      ))}
    </div>
  );
}

export function StaffSetupPanel({
  staff,
  services,
  assignments
}: {
  staff: StaffMember[];
  services: Service[];
  assignments: StaffService[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Add staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createStaffAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-staff-name">Display name</label>
              <Input id="new-staff-name" name="displayName" placeholder="Amani Perera" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-staff-phone">Phone</label>
              <Input id="new-staff-phone" name="phone" placeholder="+94..." />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Services</p>
              <ServiceCheckboxes services={services} />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="h-4 w-4 accent-primary" name="isActive" type="checkbox" defaultChecked />
              Active
            </label>
            <SubmitButton className="w-full">Create staff</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {staff.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="font-medium">No staff yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add staff members and assign the services they can perform.</p>
            </CardContent>
          </Card>
        ) : null}

        {staff.map((member) => {
          const selectedIds = assignedServiceIds(member.id, assignments);

          return (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{member.displayName}</span>
                  <Badge variant={member.isActive ? "success" : "muted"}>{member.isActive ? "Active" : "Hidden"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateStaffAction} className="space-y-4">
                  <input name="staffId" type="hidden" value={member.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`staff-${member.id}-name`}>Display name</label>
                      <Input id={`staff-${member.id}-name`} name="displayName" defaultValue={member.displayName} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor={`staff-${member.id}-phone`}>Phone</label>
                      <Input id={`staff-${member.id}-phone`} name="phone" defaultValue={member.phone ?? ""} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Services</p>
                    <ServiceCheckboxes services={services} selectedIds={selectedIds} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input className="h-4 w-4 accent-primary" name="isActive" type="checkbox" defaultChecked={member.isActive} />
                      Active on public booking
                    </label>
                    <SubmitButton variant="secondary">Save</SubmitButton>
                  </div>
                </form>
                <form action={deleteStaffAction} className="mt-3 flex justify-end">
                  <input name="staffId" type="hidden" value={member.id} />
                  <SubmitButton pendingLabel="Deleting..." variant="destructive">Delete</SubmitButton>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
