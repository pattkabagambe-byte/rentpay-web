-- Performance indexes for common query patterns
create index if not exists idx_invoices_tenant_status on public.invoices(tenant_id, status);
create index if not exists idx_invoices_landlord_status on public.invoices(landlord_id, status);
create index if not exists idx_payments_provider_ref on public.payments(provider_reference);
create index if not exists idx_payments_payer_status on public.payments(payer_id, status);
create index if not exists idx_invites_code on public.invites(code);
create index if not exists idx_properties_name_lower on public.properties(name_lower);
create index if not exists idx_wallet_user_created on public.wallet_transactions(user_id, created_at desc);
