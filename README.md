# RentPay

Rent management and payments for Uganda — built for landlords and tenants in Kampala and beyond.

**Stack:** Next.js 14 · Supabase (Auth, Postgres, Storage, Realtime) · Pesapal · Vercel

---

## Features

- **Landlord portal** — properties, units, invites, invoices, maintenance, URA tax calculator
- **Tenant portal** — link unit, pay rent (MTN/Airtel via Pesapal), utilities, chat, documents
- **Realtime** — messages and notifications
- **Uganda-first** — UGX, NWSC, UEDCL/Yaka, Uganda-focused copy

---

## Quick start (local)

### 1. Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project
- [Pesapal](https://pesapal.com) sandbox credentials (for payments)

### 2. Clone and install

```bash
git clone <repo-url> rentpay_web
cd rentpay_web
npm install
cp .env.example .env.local
```

### 3. Configure `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
PESAPAL_CONSUMER_KEY=your-sandbox-key
PESAPAL_CONSUMER_SECRET=your-sandbox-secret
```

### 4. Run Supabase migrations

See [Supabase migrations](#supabase-migrations) below.

### 5. Seed demo data (optional)

```bash
npm run seed:demo
```

Creates:
| Role | Email | Password |
|------|-------|----------|
| Landlord | `landlord@demo.rentpay.ug` | `DemoLandlord1!` |
| Tenant | `tenant@demo.rentpay.ug` | `DemoTenant1!` |

Invite code: **`DEMO2026`**

### 6. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase migrations

Migrations live in `supabase/migrations/`. Apply them in order:

| Migration | Description |
|-----------|-------------|
| `20240520000000_initial_schema.sql` | Core tables + RLS |
| `20240521000000_storage_setup.sql` | Property photos bucket |
| `20240522000000_tenant_onboarding.sql` | Onboarding + identities bucket |
| `20240523000000_invoice_logic.sql` | Invoice generation RPCs |
| `20240524000000_document_management.sql` | Document buckets |
| `20240525000000_maintenance_updates.sql` | Maintenance notes |
| `20240526000000_chat_updates.sql` | Realtime messages |
| `20240527000000_utility_policies.sql` | Utility bill policies |
| `20240528000000_settings_updates.sql` | Account deletion flags |
| `20240529000000_notifications_schema.sql` | Notifications + realtime |
| `20240530000000_production_hardening.sql` | Security hardening |

### Option A — Supabase CLI (recommended)

```bash
# Install CLI: https://supabase.com/docs/guides/cli
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### Option B — Supabase Dashboard

1. Open **SQL Editor** in your Supabase project
2. Run each migration file in chronological order
3. Verify **Database → Policies** shows RLS enabled

### Post-migration setup

1. **Auth → URL Configuration**
   - Site URL: `http://localhost:3000` (or production URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`

2. **Database → Replication**
   - Confirm `messages` and `notifications` are in the `supabase_realtime` publication

3. **Storage**
   - Verify buckets: `properties`, `identities`, `user-documents`, `tenancy-documents`, `maintenance-photos`

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import in Vercel

1. [vercel.com/new](https://vercel.com/new) → Import repository
2. Framework preset: **Next.js**
3. Root directory: `.` (default)

### 3. Environment variables

Add in **Vercel → Settings → Environment Variables**:

| Variable | Environments | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Secret** — payment webhooks |
| `NEXT_PUBLIC_APP_URL` | Production | `https://your-domain.vercel.app` |
| `PESAPAL_CONSUMER_KEY` | Production | Production keys for live |
| `PESAPAL_CONSUMER_SECRET` | Production | Production secret |
| `PESAPAL_IPN_ID` | Production | See Pesapal setup below |

Use **Preview** env vars with sandbox Pesapal keys for PR previews.

### 4. Deploy

Vercel auto-deploys on push. Verify build:

```bash
npm run build
npm test
```

### 5. Pesapal IPN setup

1. Deploy to Vercel first so the IPN URL is live
2. IPN URL: `https://your-domain.com/api/payments/pesapal-ipn`
3. Register via Pesapal merchant dashboard **or** trigger one payment (logs `PESAPAL_IPN_ID` if unset)
4. Copy `ipn_id` → set `PESAPAL_IPN_ID` in Vercel → redeploy

### 6. Update Supabase auth URLs

Set production callback URL in Supabase Auth settings to match `NEXT_PUBLIC_APP_URL`.

---

## Security

| Area | Implementation |
|------|----------------|
| **RLS** | All tables; tenants/landlords scoped by tenancy |
| **Invites** | Lookup via `lookup_invite_by_code` RPC (no open SELECT) |
| **Payments IPN** | Service role + Pesapal re-verification + idempotent RPC |
| **Rate limiting** | IPN (30/min), sign-out (20/min) — use Upstash for strict prod limits |
| **Storage** | Maintenance photos scoped to tenancy; private document buckets |
| **Logging** | Structured JSON logs on payment callbacks (Vercel function logs) |

See `docs/QA_CHECKLIST.md` for pre-launch verification.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest test suite |
| `npm run seed:demo` | Seed demo landlord/tenant/property |

---

## Project structure

```
app/                  Next.js App Router pages
  (auth)/             Login, register, password reset
  (dashboard)/        Landlord & tenant portals
  api/                Pesapal IPN, sign-out
components/           Shared UI + layout
features/             Domain modules (actions + components)
lib/                  Utilities, Pesapal, admin client
supabase/             Migrations, middleware, clients
scripts/              Demo seed script
__tests__/            Vitest tests
docs/                 QA checklist
```

---

## Testing

```bash
npm test              # run once
npm run test:watch    # watch mode
```

Tests cover:
- Route protection logic (`lib/route-guard.ts`)
- Rate limiting
- Payment initiation server action
- Pesapal IPN webhook security

---

## Troubleshooting

**Build fails — missing Supabase env vars**
→ Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.

**Payment completes but invoice stays "due"**
→ Check Vercel logs for `pesapal-ipn` events. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set and migration `20240530000000` is applied.

**Invite code not working**
→ Run production hardening migration. Codes are resolved via RPC, not open table SELECT.

**Realtime chat not updating**
→ Confirm `messages` table is in Supabase Realtime publication.

---

## License

Private — All rights reserved.
