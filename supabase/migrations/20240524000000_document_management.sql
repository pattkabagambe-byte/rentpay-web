-- Update documents table with more metadata
alter table public.documents
add column if not exists file_type text,
add column if not exists file_size int;

-- Ensure buckets exist
insert into storage.buckets (id, name, public)
values
  ('user-documents', 'user-documents', false),
  ('tenancy-documents', 'tenancy-documents', false),
  ('maintenance-photos', 'maintenance-photos', true)
on conflict (id) do nothing;

-- Storage policies for user-documents
create policy "Users can manage own user documents"
on storage.objects for all
using (
  bucket_id = 'user-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for tenancy-documents
create policy "Parties can manage tenancy documents"
on storage.objects for all
using (
  bucket_id = 'tenancy-documents'
  and exists (
    select 1 from public.tenancies
    where tenancies.id::text = (storage.foldername(storage.objects.name))[1]
    and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid())
  )
);

-- Storage policies for maintenance-photos
create policy "Public can view maintenance photos"
on storage.objects for select
using ( bucket_id = 'maintenance-photos' );

create policy "Authenticated users can upload maintenance photos"
on storage.objects for insert
with check (
  bucket_id = 'maintenance-photos'
  and auth.role() = 'authenticated'
);
