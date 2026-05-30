#!/usr/bin/env tsx
/**
 * Demo seed script for RentPay (run after migrations).
 *
 * Usage:
 *   npm run seed:demo
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO = {
  landlord: { email: 'landlord@demo.rentpay.ug', password: 'DemoLandlord1!', name: 'Sarah Nakato' },
  tenant: { email: 'tenant@demo.rentpay.ug', password: 'DemoTenant1!', name: 'James Okello' },
  property: {
    name: 'Kabalagala Heights',
    address: 'Ggaba Road, Kampala, Uganda',
    nwsc: 'NWSC-123456',
    uedcl: 'YAKA-789012',
  },
  unit: { label: 'Apt 2B', rent: 850000, dueDay: 5, graceDays: 5 },
  inviteCode: 'DEMO2026',
}

async function ensureUser(email: string, password: string, fullName: string, roles: string[]) {
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list.users.find((u) => u.email === email)

  if (existing) {
    await admin.from('profiles').update({
      full_name: fullName,
      roles,
      active_mode: roles[0],
      onboarding_completed: true,
    }).eq('id', existing.id)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data.user) throw new Error(error?.message ?? 'Failed to create user')

  await admin.from('profiles').update({
    roles,
    active_mode: roles[0],
    onboarding_completed: true,
    full_name: fullName,
  }).eq('id', data.user.id)

  return data.user.id
}

async function main() {
  console.log('Seeding RentPay demo data…')

  const landlordId = await ensureUser(
    DEMO.landlord.email,
    DEMO.landlord.password,
    DEMO.landlord.name,
    ['landlord', 'tenant']
  )

  await ensureUser(
    DEMO.tenant.email,
    DEMO.tenant.password,
    DEMO.tenant.name,
    ['tenant']
  )

  let { data: property } = await admin
    .from('properties')
    .select('id')
    .eq('owner_id', landlordId)
    .eq('name', DEMO.property.name)
    .maybeSingle()

  if (!property) {
    const { data: created, error } = await admin
      .from('properties')
      .insert({
        owner_id: landlordId,
        name: DEMO.property.name,
        address_text: DEMO.property.address,
        nwsc_account_number: DEMO.property.nwsc,
        uedcl_meter_number: DEMO.property.uedcl,
        amenities: ['Fenced', 'Parking', 'UMEME', 'NWSC Water'],
        photo_urls: [],
      })
      .select('id')
      .single()

    if (error) throw error
    property = created
  }

  let { data: unit } = await admin
    .from('units')
    .select('id')
    .eq('property_id', property.id)
    .eq('label', DEMO.unit.label)
    .maybeSingle()

  if (!unit) {
    const { data: created, error } = await admin
      .from('units')
      .insert({
        property_id: property.id,
        owner_id: landlordId,
        label: DEMO.unit.label,
        rent_amount: DEMO.unit.rent,
        currency: 'UGX',
        due_day: DEMO.unit.dueDay,
        grace_days: DEMO.unit.graceDays,
        status: 'vacant',
      })
      .select('id')
      .single()

    if (error) throw error
    unit = created
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data: existingInvite } = await admin
    .from('invites')
    .select('id')
    .eq('code', DEMO.inviteCode)
    .maybeSingle()

  if (!existingInvite) {
    await admin.from('invites').insert({
      property_id: property.id,
      unit_id: unit.id,
      landlord_id: landlordId,
      code: DEMO.inviteCode,
      expires_at: expiresAt.toISOString(),
    })
  }

  console.log('\nDemo data ready:\n')
  console.log('Landlord:', DEMO.landlord.email, '/', DEMO.landlord.password)
  console.log('Tenant:  ', DEMO.tenant.email, '/', DEMO.tenant.password)
  console.log('Property:', DEMO.property.name)
  console.log('Unit:    ', DEMO.unit.label, `(UGX ${DEMO.unit.rent.toLocaleString()}/month)`)
  console.log('Invite:  ', DEMO.inviteCode)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
