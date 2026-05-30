-- Add landlord_note to maintenance_issues
alter table public.maintenance_issues
add column if not exists landlord_note text;

-- Update RLS for maintenance_issues to be more explicit
drop policy if exists "Landlords can manage maintenance of own properties" on public.maintenance_issues;
drop policy if exists "Tenants can manage own maintenance issues" on public.maintenance_issues;

create policy "Landlords can view/update maintenance of own properties"
on public.maintenance_issues
for all using (auth.uid() = landlord_id);

create policy "Tenants can view/create own maintenance issues"
on public.maintenance_issues
for all using (auth.uid() = tenant_id);
