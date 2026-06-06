alter table public.salons
  add column if not exists booking_approval_mode text not null default 'auto';

alter table public.salons
  add constraint salons_booking_approval_mode_check
  check (booking_approval_mode in ('auto', 'manual'));
