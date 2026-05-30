export type SalonThemeMode = "light" | "dark";

export type Salon = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  accentColor: string;
  themeMode: SalonThemeMode;
  slotIntervalMinutes: number;
};
