-- Create a bucket for property photos
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

-- Allow public access to property photos
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'properties' );

-- Allow authenticated users to upload property photos
create policy "Authenticated users can upload property photos"
on storage.objects for insert
with check (
  bucket_id = 'properties'
  and auth.role() = 'authenticated'
);

-- Allow owners to delete their property photos (simplified for now)
create policy "Owners can delete their property photos"
on storage.objects for delete
using (
  bucket_id = 'properties'
  and auth.role() = 'authenticated'
);
