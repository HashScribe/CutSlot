alter table public.salons
  add column if not exists booking_window_days integer default 30,
  add column if not exists booking_window_opens_at time not null default '00:00',
  add column if not exists minimum_notice_minutes integer not null default 0,
  add column if not exists timezone text not null default 'Asia/Colombo';

alter table public.salons
  add constraint salons_booking_window_days_check
  check (booking_window_days is null or booking_window_days between 0 and 730);

alter table public.salons
  add constraint salons_minimum_notice_minutes_check
  check (minimum_notice_minutes between 0 and 525600);

alter table public.salons
  add constraint salons_timezone_not_blank_check
  check (length(trim(timezone)) > 0);
