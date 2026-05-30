"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { deleteWorkingHourAction, saveWorkingHourAction } from "@/modules/salons/lib/actions";
import type { WorkingHour } from "@/modules/salons/lib/working-hours";
import { weekdays } from "@/modules/salons/lib/weekdays";

function timeValue(value?: string) {
  return value?.slice(0, 5) ?? "";
}

export function WorkingHoursForm({
  salonId,
  workingHours
}: {
  salonId: string;
  workingHours: WorkingHour[];
}) {
  const hoursByWeekday = useMemo(
    () => new Map(workingHours.map((item) => [item.weekday, item])),
    [workingHours]
  );
  const initialWeekday = workingHours[0]?.weekday ?? 1;
  const [selectedWeekday, setSelectedWeekday] = useState(initialWeekday);
  const selectedHours = hoursByWeekday.get(selectedWeekday);
  const [startTime, setStartTime] = useState(timeValue(selectedHours?.startTime) || "09:00");
  const [endTime, setEndTime] = useState(timeValue(selectedHours?.endTime) || "17:00");
  const [state, formAction] = useActionState(saveWorkingHourAction, {
    weekday: initialWeekday
  });

  useEffect(() => {
    const nextHours = hoursByWeekday.get(selectedWeekday);
    setStartTime(timeValue(nextHours?.startTime) || "09:00");
    setEndTime(timeValue(nextHours?.endTime) || "17:00");
  }, [hoursByWeekday, selectedWeekday]);

  useEffect(() => {
    if (typeof state.weekday === "number") {
      setSelectedWeekday(state.weekday);
    }
  }, [state.weekday]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-3">
        <input name="salonId" type="hidden" value={salonId} />
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            aria-label="Start time"
            name="startTime"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
          <Input
            aria-label="End time"
            name="endTime"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </div>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success && !state.error ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
        <SubmitButton>Save hours</SubmitButton>
      </form>

      <div className="space-y-2">
        {workingHours.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No salon working hours yet.
          </p>
        ) : null}
        {workingHours.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/20 p-3">
            <div>
              <p className="text-sm font-medium">{weekdays[item.weekday]}</p>
              <p className="text-sm text-muted-foreground">{item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}</p>
            </div>
            <form action={deleteWorkingHourAction}>
              <input name="workingHourId" type="hidden" value={item.id} />
              <SubmitButton pendingLabel="..." size="icon" variant="ghost">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
