-- NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- invoice_created, payment_received, maintenance_update, new_message, rent_reminder
  title text not null,
  body text not null,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- INDEXES
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read_at on public.notifications(read_at);

-- RLS POLICIES
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications for update
using (auth.uid() = user_id);

-- ENABLE REALTIME
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notifications;

-- HELPER FUNCTION TO CREATE NOTIFICATION
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_id uuid;
begin
  insert into public.notifications (user_id, type, title, body, metadata)
  values (p_user_id, p_type, p_title, p_body, p_metadata)
  returning id into v_id;

  return v_id;
end;
$$ language plpgsql security definer;
