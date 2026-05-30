-- Add deletion_requested flag to profiles
alter table public.profiles
add column if not exists deletion_requested boolean default false,
add column if not exists deletion_requested_at timestamptz;
