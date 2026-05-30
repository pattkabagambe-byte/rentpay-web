-- Yo! Payments completion RPC (replaces Pesapal for new payments)
create or replace function public.complete_yo_payment(
  p_external_reference text,
  p_transaction_reference text default null,
  p_succeeded boolean default true,
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
  where id::text = p_external_reference
     or (p_transaction_reference is not null and provider_reference = p_transaction_reference)
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'payment_not_found');
  end if;

  if v_payment.status = 'completed' then
    return jsonb_build_object('ok', true, 'reason', 'already_completed');
  end if;

  if p_transaction_reference is not null and v_payment.provider_reference is distinct from p_transaction_reference then
    update public.payments
    set provider_reference = p_transaction_reference
    where id = v_payment.id;
  end if;

  if p_succeeded then
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
    values (
      v_payment.landlord_id,
      v_payment.amount,
      v_payment.currency,
      'credit',
      'completed',
      coalesce(p_transaction_reference, v_payment.provider_reference)
    );

    insert into public.wallet_transactions (user_id, amount, currency, type, status, provider_reference)
    values (
      v_payment.payer_id,
      v_payment.amount,
      v_payment.currency,
      'debit',
      'completed',
      v_payment.id::text
    );

    return jsonb_build_object('ok', true, 'reason', 'completed');
  else
    update public.payments set status = 'failed' where id = v_payment.id;
    return jsonb_build_object('ok', true, 'reason', 'failed');
  end if;
end;
$$;

revoke all on function public.complete_yo_payment(text, text, boolean, text) from public;
