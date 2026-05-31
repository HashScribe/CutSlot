# CutSlot

Premium multi-tenant salon booking SaaS.

## Phase 1 Local Setup

1. Install dependencies:

```bash
yarn install
```

2. Create `.env.local`:

```bash
cp .env.example .env.local
```

3. Add Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

For local Supabase, get these with:

```bash
supabase status
```

`SUPABASE_SERVICE_ROLE_KEY` is required for public booking creation. Keep it server-only and never expose it with a `NEXT_PUBLIC_` prefix.

4. Reset the local Supabase database:

```bash
supabase db reset
```

This applies `supabase/migrations/0001_foundation.sql` and runs `supabase/seed.sql`.
The seed creates the local demo auth user, tenant, salon, and owner membership.

Demo admin:

```txt
email: admin@cutslot.com
password: asd123
```

5. Start the app:

```bash
yarn dev
```

The admin login is at `/admin/login`. The protected dashboard is at `/admin`.
