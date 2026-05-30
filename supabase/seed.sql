# Demo seed data (reference only — use `npm run seed:demo` for automated seeding)
#
# After running migrations, the seed script creates:
#   landlord@demo.rentpay.ug / DemoLandlord1!
#   tenant@demo.rentpay.ug  / DemoTenant1!
#   Property: Kabalagala Heights, Unit Apt 2B, Invite code DEMO2026

-- Manual SQL example (replace UUIDs with real auth.users ids):
--
-- insert into public.properties (owner_id, name, address_text, amenities)
-- values ('<landlord-uuid>', 'Kabalagala Heights', 'Ggaba Road, Kampala', '{Parking,UMEME}');
--
-- insert into public.units (property_id, owner_id, label, rent_amount, due_day, status)
-- values ('<property-uuid>', '<landlord-uuid>', 'Apt 2B', 850000, 5, 'vacant');
--
-- insert into public.invites (property_id, unit_id, landlord_id, code, expires_at)
-- values ('<property-uuid>', '<unit-uuid>', '<landlord-uuid>', 'DEMO2026', now() + interval '30 days');
