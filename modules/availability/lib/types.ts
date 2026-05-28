export type TimeWindow = {
  start: Date;
  end: Date;
};

export type GenerateSlotsInput = {
  date: Date;
  workingWindows: TimeWindow[];
  blockedWindows: TimeWindow[];
  existingBookings: TimeWindow[];
  durationMinutes: number;
  bufferMinutes: number;
  slotIntervalMinutes?: number;
};

export type AvailabilitySlot = {
  start: Date;
  end: Date;
};
