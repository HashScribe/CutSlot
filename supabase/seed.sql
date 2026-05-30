-- Local development seed.
--
-- `supabase db reset` wipes the local database, including auth users, then
-- runs this file. That means local seed data must create the demo auth user
-- and its matching auth identity before linking tenant membership.
--
-- Demo login:
-- email: admin@cutslot.com
-- password: asd123

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '37f08cef-4921-4251-a14e-991fbff751f3',
  'authenticated',
  'authenticated',
  'admin@cutslot.com',
  crypt('asd123', gen_salt('bf')),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "CutSlot Admin"}'::jsonb,
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  '',
  ''
)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '37f08cef-4921-4251-a14e-991fbff751f3',
  '37f08cef-4921-4251-a14e-991fbff751f3',
  '37f08cef-4921-4251-a14e-991fbff751f3',
  '{
    "sub": "37f08cef-4921-4251-a14e-991fbff751f3",
    "email": "admin@cutslot.com",
    "email_verified": true,
    "phone_verified": false
  }'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.tenants (id, name)
values ('00000000-0000-0000-0000-000000000001', 'CutSlot Demo Salon')
on conflict (id) do update set name = excluded.name;

insert into public.salons (
  id,
  tenant_id,
  name,
  slug,
  phone,
  address,
  accent_color,
  theme_mode,
  slot_interval_minutes
)
values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'CutSlot Demo Salon',
  'demo-salon',
  '+94770000000',
  'Colombo, Sri Lanka',
  '#C8A97E',
  'light',
  15
)
on conflict (slug) do update set
  name = excluded.name,
  phone = excluded.phone,
  address = excluded.address,
  accent_color = excluded.accent_color,
  theme_mode = excluded.theme_mode,
  slot_interval_minutes = excluded.slot_interval_minutes;

insert into public.tenant_users (tenant_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  '37f08cef-4921-4251-a14e-991fbff751f3',
  'owner'
)
on conflict (tenant_id, user_id) do update set role = excluded.role;

insert into public.services (
  id,
  tenant_id,
  salon_id,
  name,
  description,
  duration_minutes,
  buffer_minutes,
  price_cents,
  is_active
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Signature Haircut',
    'Consultation, wash, cut, and finish.',
    45,
    10,
    450000,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Color Touch-up',
    'Root color refresh with blow dry.',
    90,
    15,
    1250000,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  buffer_minutes = excluded.buffer_minutes,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active;

insert into public.staff (
  id,
  tenant_id,
  salon_id,
  display_name,
  phone,
  is_active
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Amani Perera',
    '+94771111111',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Nisha Fernando',
    '+94772222222',
    true
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  phone = excluded.phone,
  is_active = excluded.is_active;

insert into public.staff_services (tenant_id, staff_id, service_id)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000202'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000201'
  )
on conflict (staff_id, service_id) do nothing;

insert into public.working_hours (
  id,
  tenant_id,
  salon_id,
  weekday,
  start_time,
  end_time,
  is_active
)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 1, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 2, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 3, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 4, '09:00', '17:00', true),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 5, '09:00', '17:00', true)
on conflict (id) do update set
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  is_active = excluded.is_active;
