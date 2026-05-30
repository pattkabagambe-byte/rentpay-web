-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- Function to update last message in tenancy
create or replace function public.handle_new_message()
returns trigger as $$
begin
  update public.tenancies
  set
    last_message = new.text,
    last_message_at = new.sent_at,
    updated_at = now()
  where id = new.tenancy_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new message
create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.handle_new_message();
