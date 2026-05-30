-- Update RLS for utility_bills to allow landlords to manage them
create policy "Landlords can insert utility bills for their tenancies"
on public.utility_bills
for insert
with check (
  exists (
    select 1 from public.tenancies
    where tenancies.id = utility_bills.tenancy_id
    and tenancies.landlord_id = auth.uid()
  )
);

create policy "Landlords can update utility bills for their tenancies"
on public.utility_bills
for update
using (
  exists (
    select 1 from public.tenancies
    where tenancies.id = utility_bills.tenancy_id
    and tenancies.landlord_id = auth.uid()
  )
);
