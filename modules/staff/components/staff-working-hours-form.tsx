"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { deleteStaffWorkingHourAction, saveStaffWorkingHourAction } from "@/modules/staff/lib/actions";
import type { StaffMember } from "@/modules/staff/lib/types";
import type { WorkingHour } from "@/modules/salons/lib/working-hours";
import { weekdays } from "@/modules/salons/lib/weekdays";

function timeValue(value?: string) {
  return value?.slice(0, 5) ?? "";
}

export function StaffWorkingHoursForm({
  salonId,
  staff,
  workingHours
}: {
  salonId: string;
  staff: StaffMember[];
  workingHours: WorkingHour[];
}) {
  const initialStaffId = staff[0]?.id ?? "";
  const [selectedStaffId, setSelectedStaffId] = useState(initialStaffId);
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const hoursByStaffDay = useMemo(
    () => new Map(workingHours.map((item) => [`${item.staffId}:${item.weekday}`, item])),
    [workingHours]
  );
  const selectedHours = hoursByStaffDay.get(`${selectedStaffId}:${selectedWeekday}`);
  const [startTime, setStartTime] = useState(timeValue(selectedHours?.startTime) || "09:00");
  const [endTime, setEndTime] = useState(timeValue(selectedHours?.endTime) || "17:00");
  const [state, formAction] = useActionState(saveStaffWorkingHourAction, {
    staffId: initialStaffId,
    weekday: 1
  });

  useEffect(() => {
    const nextHours = hoursByStaffDay.get(`${selectedStaffId}:${selectedWeekday}`);
    setStartTime(timeValue(nextHours?.startTime) || "09:00");
    setEndTime(timeValue(nextHours?.endTime) || "17:00");
  }, [hoursByStaffDay, selectedStaffId, selectedWeekday]);

  useEffect(() => {
    if (state.staffId) setSelectedStaffId(state.staffId);
    if (typeof state.weekday === "number") setSelectedWeekday(state.weekday);
  }, [state.staffId, state.weekday]);

  if (staff.length === 0) {
    return <p className="text-sm text-muted-foreground">Add staff before setting staff-specific working hours.</p>;
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <input name="salonId" type="hidden" value={salonId} />
        <select
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          name="staffId"
          value={selectedStaffId}
          onChange={(event) => setSelectedStaffId(event.target.value)}
        >
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.displayName}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          name="weekday"
          value={selectedWeekday}
          onChange={(event) => setSelectedWeekday(Number(event.target.value))}
        >
          {weekdays.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
        <Input name="startTime" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
        <Input name="endTime" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required />
        <div className="md:col-span-2">
          {state.error ? <p className="mb-3 text-sm text-destructive">{state.error}</p> : null}
          {state.success && !state.error ? <p className="mb-3 text-sm text-emerald-400">{state.success}</p> : null}
          <SubmitButton className="w-full">Save staff hours</SubmitButton>
        </div>
      </form>

      <div className="grid gap-2">
        {workingHours.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No staff-specific working hours yet. Staff will use salon hours by default.
          </p>
        ) : null}
        {workingHours.map((item) => {
          const member = staff.find((candidate) => candidate.id === item.staffId);
          return (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/20 p-3">
              <div>
                <p className="text-sm font-medium">{member?.displayName ?? "Staff member"}</p>
                <p className="text-sm text-muted-foreground">
                  {weekdays[item.weekday]} · {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                </p>
              </div>
              <form action={deleteStaffWorkingHourAction}>
                <input name="workingHourId" type="hidden" value={item.id} />
                <SubmitButton pendingLabel="..." size="icon" variant="ghost">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </SubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
