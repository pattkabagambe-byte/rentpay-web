-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- USERS / PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  roles text[] default '{tenant}',
  active_mode text default 'tenant',
  nin text,
  emergency_contact text,
  preferred_payment_method text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PROPERTIES
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  name_lower text generated always as (lower(name)) stored,
  address_text text,
  nwsc_account_number text,
  uedcl_meter_number text,
  water_meter_number text,
  power_meter_number text,
  rubbish_collection_account text,
  tenancy_agreement_url text,
  amenities text[],
  photo_urls text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.properties enable row level security;

-- UNITS
create table public.units (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  rent_amount numeric not null default 0,
  currency text default 'UGX',
  due_day int default 1,
  grace_days int default 5,
  status text default 'vacant',
  tenant_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.units enable row level security;

-- TENANCIES
create table public.tenancies (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'active',
  started_at timestamptz default now(),
  ended_at timestamptz,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tenancies enable row level security;

-- INVITES
create table public.invites (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  code text unique not null,
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.invites enable row level security;

-- INVOICES
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  period_from date not null,
  period_to date not null,
  due_date date not null,
  amount_due numeric not null,
  currency text default 'UGX',
  status text default 'due',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

-- PAYMENTS
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete set null,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  payer_id uuid references public.profiles(id) on delete set null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  currency text default 'UGX',
  method text,
  provider text,
  provider_reference text,
  status text default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

-- MAINTENANCE ISSUES
create table public.maintenance_issues (
  id uuid default gen_random_uuid() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_id uuid references public.units(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  category text,
  description text,
  photo_urls text[],
  status text default 'reported',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.maintenance_issues enable row level security;

-- UTILITY BILLS
create table public.utility_bills (
  id uuid default gen_random_uuid() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  type text not null,
  amount numeric not null,
  currency text default 'UGX',
  notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.utility_bills enable row level security;

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  tenancy_id uuid references public.tenancies(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  sent_at timestamptz default now()
);

alter table public.messages enable row level security;

-- DOCUMENTS
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  tenancy_id uuid references public.tenancies(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text,
  title text not null,
  file_url text,
  content text,
  signature_data jsonb,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

-- WALLET TRANSACTIONS
create table public.wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  currency text default 'UGX',
  type text not null,
  status text default 'pending',
  provider_reference text,
  created_at timestamptz default now()
);

alter table public.wallet_transactions enable row level security;

-- TRIGGERS FOR UPDATED_AT
create trigger handle_updated_at_profiles before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_properties before update on public.properties for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_units before update on public.units for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_tenancies before update on public.tenancies for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_invoices before update on public.invoices for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_maintenance before update on public.maintenance_issues for each row execute procedure public.handle_updated_at();

-- INDEXES
create index idx_properties_owner_id on public.properties(owner_id);
create index idx_units_property_id on public.units(property_id);
create index idx_units_tenant_id on public.units(tenant_id);
create index idx_tenancies_unit_id on public.tenancies(unit_id);
create index idx_tenancies_tenant_id on public.tenancies(tenant_id);
create index idx_tenancies_landlord_id on public.tenancies(landlord_id);
create index idx_invoices_tenancy_id on public.invoices(tenancy_id);
create index idx_payments_invoice_id on public.payments(invoice_id);
create index idx_messages_tenancy_id on public.messages(tenancy_id);

-- RLS POLICIES

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Landlords can view tenant profiles" on public.profiles for select using (
  exists (select 1 from public.tenancies where tenancies.landlord_id = auth.uid() and tenancies.tenant_id = profiles.id)
);
create policy "Tenants can view landlord profiles" on public.profiles for select using (
  exists (select 1 from public.tenancies where tenancies.tenant_id = auth.uid() and tenancies.landlord_id = profiles.id)
);

-- Properties
create policy "Landlords can manage own properties" on public.properties for all using (auth.uid() = owner_id);
create policy "Tenants can view property of their tenancy" on public.properties for select using (
  exists (select 1 from public.tenancies where tenancies.property_id = properties.id and tenancies.tenant_id = auth.uid())
);

-- Units
create policy "Landlords can manage own units" on public.units for all using (auth.uid() = owner_id);
create policy "Tenants can view their unit" on public.units for select using (auth.uid() = tenant_id);

-- Tenancies
create policy "Landlords can manage own tenancies" on public.tenancies for all using (auth.uid() = landlord_id);
create policy "Tenants can view own tenancies" on public.tenancies for select using (auth.uid() = tenant_id);

-- Invites
create policy "Landlords can manage own invites" on public.invites for all using (auth.uid() = landlord_id);
create policy "Public can view invite by code" on public.invites for select using (true);

-- Invoices
create policy "Landlords can manage own invoices" on public.invoices for all using (auth.uid() = landlord_id);
create policy "Tenants can view own invoices" on public.invoices for select using (auth.uid() = tenant_id);

-- Payments
create policy "Landlords can view own payments" on public.payments for select using (auth.uid() = landlord_id);
create policy "Tenants can manage own payments" on public.payments for all using (auth.uid() = payer_id);

-- Maintenance
create policy "Landlords can manage maintenance of own properties" on public.maintenance_issues for all using (auth.uid() = landlord_id);
create policy "Tenants can manage own maintenance issues" on public.maintenance_issues for all using (auth.uid() = tenant_id);

-- Utility Bills
create policy "Landlords/Tenants can view utility bills" on public.utility_bills for select using (
  exists (select 1 from public.tenancies where tenancies.id = utility_bills.tenancy_id and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid()))
);

-- Messages
create policy "Parties can view/send messages in their tenancy" on public.messages for all using (
  exists (select 1 from public.tenancies where tenancies.id = messages.tenancy_id and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid()))
);

-- Documents
create policy "Parties can view documents in their tenancy" on public.documents for select using (
  auth.uid() = user_id or
  exists (select 1 from public.tenancies where tenancies.id = documents.tenancy_id and (tenancies.landlord_id = auth.uid() or tenancies.tenant_id = auth.uid()))
);
create policy "Users can manage own documents" on public.documents for all using (auth.uid() = user_id);

-- Wallet
create policy "Users can manage own wallet transactions" on public.wallet_transactions for all using (auth.uid() = user_id);
