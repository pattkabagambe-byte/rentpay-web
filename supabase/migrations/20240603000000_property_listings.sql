-- Property listings marketplace table
CREATE TABLE IF NOT EXISTS property_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  property_type text NOT NULL DEFAULT 'apartment',
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  rent_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'UGX',
  deposit_amount numeric,
  available_from date,
  location_text text NOT NULL,
  location_area text,
  amenities text[] DEFAULT '{}',
  photo_urls text[] DEFAULT '{}',
  contact_phone text,
  contact_email text,
  status text NOT NULL DEFAULT 'active',
  views integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_landlord ON property_listings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON property_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON property_listings(location_area);
CREATE INDEX IF NOT EXISTS idx_listings_rent ON property_listings(rent_amount);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_listing_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS listings_updated_at ON property_listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON property_listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_updated_at();

-- RLS
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;

-- Public can read active listings
CREATE POLICY "Public read active listings"
  ON property_listings FOR SELECT
  USING (status = 'active');

-- Landlords manage their own listings
CREATE POLICY "Landlords manage own listings"
  ON property_listings FOR ALL
  USING (landlord_id = auth.uid())
  WITH CHECK (landlord_id = auth.uid());

-- Increment view count (can be called by anyone)
CREATE OR REPLACE FUNCTION increment_listing_views(p_listing_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE property_listings SET views = views + 1 WHERE id = p_listing_id;
$$;
