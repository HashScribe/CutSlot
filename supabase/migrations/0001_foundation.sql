create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type tenant_role as enum ('owner', 'admin', 'staff');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
create type notification_status as enum ('pending', 'sent', 'failed', 'skipped');
create type notification_channel as enum ('whatsapp');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.tenant_users (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role tenant_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table public.salons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null unique,
  phone text,
  address text,
  logo_url text,
  accent_color text not null default '#C8A97E',
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  price_cents integer check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  display_name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_services (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  check (start_time < end_time)
);

create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (starts_at < ends_at)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (salon_id, phone)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'confirmed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

alter table public.bookings
  add constraint bookings_no_staff_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(start_time, end_time, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

create table public.notification_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  whatsapp_enabled boolean not null default false,
  notify_customer_on_booking boolean not null default true,
  notify_salon_on_booking boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.whatsapp_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  provider text not null default 'disabled' check (provider in ('disabled', 'twilio', 'meta')),
  from_number text,
  salon_alert_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  channel notification_channel not null,
  status notification_status not null,
  recipient text not null,
  message text not null,
  error_message text,
  created_at timestamptz not null default now()
);

create index salons_tenant_id_idx on public.salons(tenant_id);
create index services_tenant_salon_idx on public.services(tenant_id, salon_id);
create index staff_tenant_salon_idx on public.staff(tenant_id, salon_id);
create index bookings_tenant_salon_start_idx on public.bookings(tenant_id, salon_id, start_time);
create index bookings_staff_start_idx on public.bookings(staff_id, start_time);
create index customers_tenant_salon_idx on public.customers(tenant_id, salon_id);

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_users enable row level security;
alter table public.salons enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.blocked_times enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.notification_settings enable row level security;
alter table public.whatsapp_settings enable row level security;
alter table public.notification_logs enable row level security;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
  );
$$;

create policy "tenant members can read tenants"
on public.tenants for select
using (public.is_tenant_member(id));

create policy "users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "tenant members can read memberships"
on public.tenant_users for select
using (public.is_tenant_member(tenant_id));

create policy "public can read active salon profiles"
on public.salons for select
using (true);

create policy "tenant members manage salons"
on public.salons for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "public can read active services"
on public.services for select
using (is_active = true);

create policy "tenant members manage services"
on public.services for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "public can read active staff"
on public.staff for select
using (is_active = true);

create policy "tenant members manage staff"
on public.staff for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage staff service assignments"
on public.staff_services for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage working hours"
on public.working_hours for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage blocked times"
on public.blocked_times for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage customers"
on public.customers for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage tenant scoped data"
on public.bookings for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage notification settings"
on public.notification_settings for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members manage whatsapp settings"
on public.whatsapp_settings for all
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

create policy "tenant members read notification logs"
on public.notification_logs for select
using (public.is_tenant_member(tenant_id));
