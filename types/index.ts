export type UserRole = 'landlord' | 'tenant';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  roles: UserRole[];
  active_mode: UserRole;
  nin?: string;
  emergency_contact?: string;
  preferred_payment_method?: string;
  preferred_payment_date?: number;
  reminder_days?: number;
  id_front_url?: string;
  id_back_url?: string;
  terms_accepted: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address_text: string;
  nwsc_account_number?: string;
  uedcl_meter_number?: string;
  water_meter_number?: string;
  power_meter_number?: string;
  rubbish_collection_account?: string;
  tenancy_agreement_url?: string;
  amenities?: string[];
  photo_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  owner_id: string;
  label: string;
  rent_amount: number;
  currency: string;
  due_day: number;
  grace_days: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Invite {
  id: string;
  property_id: string;
  unit_id: string;
  landlord_id: string;
  code: string;
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface Tenancy {
  id: string;
  property_id: string;
  unit_id: string;
  landlord_id: string;
  tenant_id: string;
  status: 'active' | 'ended' | 'pending';
  started_at: string;
  ended_at?: string;
  created_at: string;
}
