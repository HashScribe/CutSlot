export type TimeWindow = {
  start: Date;
  end: Date;
};

export type GenerateSlotsInput = {
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
  staffId?: string;
};

export type StaffAvailability = {
  staffId: string;
  staffName: string;
  slots: AvailabilitySlot[];
};
