-- Production hardening: RLS, RPC access, invite lookup, storage, payment completion

-- ---------------------------------------------------------------------------
-- Invites: remove open SELECT; tenants resolve codes via security definer RPC
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view invite by code" on public.invites;

create or replace function public.lookup_invite_by_code(p_code text)
returns table (
  id uuid,
  property_id uuid,
  unit_id uuid,
  landlord_id uuid,
  expires_at timestamptz,
  used_by uuid
)
language sql
security definer
set search_path = public
as $$
  select i.id, i.property_id, i.unit_id, i.landlord_id, i.expires_at, i.used_by
  from public.invites i
  where i.code = upper(trim(p_code))
    and i.used_by is null
    and (i.expires_at is null or i.expires_at > now());
$$;

revoke all on function public.lookup_invite_by_code(text) from public;
grant execute on function public.lookup_invite_by_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Restrict security definer RPCs to authenticated (tenancy-scoped in app layer)
-- ---------------------------------------------------------------------------
revoke all on function public.generate_monthly_invoice(uuid) from public;
grant execute on function public.generate_monthly_invoice(uuid) to authenticated;

revoke all on function public.refresh_invoice_statuses() from public;
grant execute on function public.refresh_invoice_statuses() to authenticated;

revoke all on function public.create_notification(uuid, text, text, text, jsonb) from public;
-- Inserts only via service role / triggers; no authenticated grant

-- ---------------------------------------------------------------------------
-- Payments: tenants may insert pending and read own; updates via service role IPN
-- ---------------------------------------------------------------------------
drop policy if exists "Tenants can manage own payments" on public.payments;

create policy "Tenants can view own payments"
  on public.payments for select
  using (auth.uid() = payer_id);

create policy "Tenants can create pending payments"
  on public.payments for insert
  with check (auth.uid() = payer_id and status = 'pending');

-- ---------------------------------------------------------------------------
-- Vacant units visible for property discovery (invite join flow)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can view vacant units"
  on public.units for select
  using (status = 'vacant' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage: scope maintenance uploads to tenancy participants
-- App uploads to maintenance-photos/{tenancy_id}/...
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can upload maintenance photos" on storage.objects;
drop policy if exists "Authenticated users can delete own maintenance photos" on storage.objects;

create policy "Tenancy parties can upload maintenance photos"
  on storage.objects for insert
  with check (
    bucket_id = 'maintenance-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.tenancies
      where tenancies.id::text = (storage.foldername(name))[1]
        and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid())
    )
  );

create policy "Tenancy parties can delete maintenance photos"
  on storage.objects for delete
  using (
    bucket_id = 'maintenance-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.tenancies
      where tenancies.id::text = (storage.foldername(name))[1]
        and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid())
    )
  );

-- Property photos: keep authenticated upload; public read (existing behaviour)
drop policy if exists "Authenticated users can delete own property uploads" on storage.objects;

create policy "Authenticated users can delete property photos"
  on storage.objects for delete
  using (
    bucket_id = 'properties'
    and auth.role() = 'authenticated'
  );

-- ---------------------------------------------------------------------------
-- Idempotent Pesapal payment completion (service role / admin client only)
-- ---------------------------------------------------------------------------
create or replace function public.complete_pesapal_payment(
  p_order_tracking_id text,
  p_status_code int,
  p_payment_method text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
begin
  select * into v_payment
  from public.payments
  where provider_reference = p_order_tracking_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'payment_not_found');
  end if;

  if v_payment.status = 'completed' then
    return jsonb_build_object('ok', true, 'reason', 'already_completed');
  end if;

  if p_status_code = 1 then
    update public.payments
    set status = 'completed',
        paid_at = now(),
        method = coalesce(p_payment_method, method)
    where id = v_payment.id;

    if v_payment.invoice_id is not null then
      update public.invoices
      set status = 'paid'
      where id = v_payment.invoice_id;
    end if;

    insert into public.wallet_transactions (user_id, amount, currency, type, status, provider_reference)
    values (v_payment.landlord_id, v_payment.amount, v_payment.currency, 'credit', 'completed', p_order_tracking_id);

    insert into public.wallet_transactions (user_id, amount, currency, type, status, provider_reference)
    values (v_payment.payer_id, v_payment.amount, v_payment.currency, 'debit', 'completed', v_payment.id::text);

    return jsonb_build_object('ok', true, 'reason', 'completed');
  elsif p_status_code = 2 then
    update public.payments set status = 'failed' where id = v_payment.id;
    return jsonb_build_object('ok', true, 'reason', 'failed');
  end if;

  return jsonb_build_object('ok', true, 'reason', 'ignored_status');
end;
$$;

revoke all on function public.complete_pesapal_payment(text, int, text) from public;
-- Called via service role only (no grant to authenticated)
