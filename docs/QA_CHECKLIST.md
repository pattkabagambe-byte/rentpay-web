# RentPay — Production QA Checklist

Use this checklist before and after each production deploy.

## Environment

- [ ] All Vercel env vars set (see `.env.example`)
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain (https)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only, never `NEXT_PUBLIC_`)
- [ ] `PESAPAL_IPN_ID` registered and set
- [ ] Pesapal production keys configured (not sandbox)

## Supabase

- [ ] All migrations applied (`20240520000000` through `20240530000000`)
- [ ] RLS enabled on all public tables
- [ ] Realtime enabled for `messages` and `notifications`
- [ ] Storage buckets exist: `properties`, `identities`, `user-documents`, `tenancy-documents`, `maintenance-photos`
- [ ] Auth redirect URLs include `https://your-domain.com/auth/callback`
- [ ] Email auth provider configured

## Auth & routing

- [ ] Unauthenticated users redirected from `/landlord`, `/tenant`, `/settings`, `/wallet`, `/messages`
- [ ] Login / register work (email + Google if enabled)
- [ ] Password reset lands on `/reset-password` after email link
- [ ] Onboarding gate works for new users
- [ ] Mode switcher (landlord ↔ tenant) works

## Landlord flows

- [ ] Create property with NWSC / UEDCL account numbers
- [ ] Upload property photos
- [ ] Create unit with UGX rent amount
- [ ] Generate invite code
- [ ] View dashboard summary cards
- [ ] Receive payment notification after tenant pays

## Tenant flows

- [ ] Link property via invite code
- [ ] View invoices and utility bills
- [ ] Initiate Pesapal payment (sandbox/prod)
- [ ] IPN callback marks invoice paid
- [ ] Wallet shows credit/debit transactions
- [ ] Report maintenance issue with photo
- [ ] Chat with landlord (realtime)

## Payments security

- [ ] IPN verifies order exists in DB before processing
- [ ] IPN re-verifies status with Pesapal API
- [ ] Duplicate IPN calls are idempotent
- [ ] IPN logs appear in Vercel function logs (JSON)
- [ ] Merchant reference mismatch rejected

## Performance & mobile

- [ ] Dashboard loads on mobile (375px width)
- [ ] Bottom nav works on mobile
- [ ] Toast notifications visible above bottom nav
- [ ] Loading skeletons appear on slow connections

## Automated tests

```bash
npm test
```

- [ ] Route guard tests pass
- [ ] Rate limit tests pass
- [ ] Payment action tests pass
- [ ] Pesapal IPN route tests pass

## Post-deploy smoke test

1. Sign in as demo landlord
2. Sign in as demo tenant (separate browser/incognito)
3. Tenant links unit with invite code
4. Tenant pays invoice via Pesapal
5. Confirm landlord dashboard shows payment received
6. Send a chat message both directions

## Monitoring

- [ ] Vercel deployment logs accessible
- [ ] Supabase dashboard → Logs for auth errors
- [ ] Pesapal merchant dashboard for transaction status
