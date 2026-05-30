-- Function to generate monthly invoice for a tenancy
create or replace function public.generate_monthly_invoice(p_tenancy_id uuid)
returns uuid as $$
declare
    v_invoice_id uuid;
    v_property_id uuid;
    v_unit_id uuid;
    v_landlord_id uuid;
    v_tenant_id uuid;
    v_amount numeric;
    v_currency text;
    v_due_day int;
    v_grace_days int;
    v_period_from date;
    v_period_to date;
    v_due_date date;
begin
    -- 1. Get Tenancy/Unit details
    select
        t.property_id, t.unit_id, t.landlord_id, t.tenant_id,
        u.rent_amount, u.currency, u.due_day, u.grace_days
    into
        v_property_id, v_unit_id, v_landlord_id, v_tenant_id,
        v_amount, v_currency, v_due_day, v_grace_days
    from public.tenancies t
    join public.units u on u.id = t.unit_id
    where t.id = p_tenancy_id;

    -- 2. Calculate dates for current month
    v_period_from := date_trunc('month', current_date)::date;
    v_period_to := (date_trunc('month', current_date) + interval '1 month - 1 day')::date;

    -- Due date is v_due_day of current month
    v_due_date := (date_trunc('month', current_date) + (v_due_day - 1) * interval '1 day')::date;

    -- 3. Check if invoice already exists for this period
    select id into v_invoice_id
    from public.invoices
    where tenancy_id = p_tenancy_id
      and period_from = v_period_from;

    if v_invoice_id is null then
        insert into public.invoices (
            tenancy_id, property_id, unit_id, tenant_id, landlord_id,
            period_from, period_to, due_date, amount_due, currency, status
        ) values (
            p_tenancy_id, v_property_id, v_unit_id, v_tenant_id, v_landlord_id,
            v_period_from, v_period_to, v_due_date, v_amount, v_currency, 'due'
        ) returning id into v_invoice_id;
    end if;

    return v_invoice_id;
end;
$$ language plpgsql security definer;

-- Function to update overdue statuses
create or replace function public.refresh_invoice_statuses()
returns void as $$
begin
    update public.invoices
    set status = 'overdue'
    where status = 'due'
      and current_date > (due_date + (select grace_days from public.units where units.id = invoices.unit_id));
end;
$$ language plpgsql security definer;
