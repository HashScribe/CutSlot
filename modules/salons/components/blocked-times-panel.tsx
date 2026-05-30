import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBlockedTimeAction, deleteBlockedTimeAction } from "@/modules/salons/lib/actions";
import type { BlockedTime } from "@/modules/salons/lib/blocked-times";
import type { StaffMember } from "@/modules/staff/lib/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function BlockedTimesPanel({
  salonId,
  staff,
  blockedTimes
}: {
  salonId: string;
  staff: StaffMember[];
  blockedTimes: BlockedTime[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked times</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={createBlockedTimeAction} className="grid gap-3 md:grid-cols-2">
          <input name="salonId" type="hidden" value={salonId} />
          <select
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="staffId"
            defaultValue=""
          >
            <option value="">Whole salon</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
          <Input name="reason" placeholder="Reason, e.g. Holiday" />
          <Input name="startsAt" type="datetime-local" required />
          <Input name="endsAt" type="datetime-local" required />
          <SubmitButton className="md:col-span-2">Block time</SubmitButton>
        </form>

        <div className="space-y-2">
          {blockedTimes.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              No blocked times yet.
            </p>
          ) : null}
          {blockedTimes.map((item) => {
            const member = staff.find((candidate) => candidate.id === item.staffId);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/20 p-3">
                <div>
                  <p className="text-sm font-medium">{item.staffId ? member?.displayName ?? "Staff member" : "Whole salon"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(item.startsAt)} - {formatDateTime(item.endsAt)}
                  </p>
                  {item.reason ? <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p> : null}
                </div>
                <form action={deleteBlockedTimeAction}>
                  <input name="blockedTimeId" type="hidden" value={item.id} />
                  <SubmitButton pendingLabel="..." size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </SubmitButton>
                </form>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
