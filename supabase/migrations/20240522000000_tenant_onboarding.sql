-- Add tenant specific fields to profiles
alter table public.profiles
add column if not exists preferred_payment_date int,
add column if not exists reminder_days int default 3,
add column if not exists id_front_url text,
add column if not exists id_back_url text,
add column if not exists terms_accepted boolean default false;

-- Create bucket for ID documents
insert into storage.buckets (id, name, public)
values ('identities', 'identities', false)
on conflict (id) do nothing;

-- Storage policies for identities
create policy "Users can upload their own IDs"
on storage.objects for insert
with check (
  bucket_id = 'identities'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own IDs"
on storage.objects for select
using (
  bucket_id = 'identities'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Landlords can view their tenants IDs"
on storage.objects for select
using (
  bucket_id = 'identities'
  and exists (
    select 1 from public.tenancies
    where tenancies.landlord_id = auth.uid()
    and tenancies.tenant_id::text = (storage.foldername(storage.objects.name))[1]
  )
);
