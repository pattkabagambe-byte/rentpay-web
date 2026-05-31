'use server'
import { createClient } from '@/supabase/server'
import { createAdminClient } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().max(2000).optional(),
  property_type: z.enum(['apartment', 'house', 'studio', 'commercial', 'room', 'mansion']),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  rent_amount: z.number().positive('Rent must be greater than 0'),
  currency: z.string().default('UGX'),
  deposit_amount: z.number().positive().optional(),
  available_from: z.string().optional(),
  location_text: z.string().min(3, 'Location is required'),
  location_area: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  property_id: z.string().uuid().optional(),
})

export async function createListing(formData: unknown) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = listingSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { data, error } = await supabase
    .from('property_listings')
    .insert({ ...parsed.data, landlord_id: user.id, status: 'active' })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/landlord/listings')
  revalidatePath('/listings')
  return { id: data.id }
}

export async function updateListing(id: string, formData: unknown) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = listingSchema.partial().safeParse(formData)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { error } = await supabase
    .from('property_listings')
    .update(parsed.data)
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/landlord/listings')
  revalidatePath('/listings')
  revalidatePath(`/listings/${id}`)
  return { success: true }
}

export async function toggleListingStatus(id: string, status: 'active' | 'paused') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('property_listings')
    .update({ status })
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/landlord/listings')
  return { success: true }
}

export async function markListingRented(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('property_listings')
    .update({ status: 'rented' })
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/landlord/listings')
  return { success: true }
}

export async function deleteListing(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('property_listings')
    .delete()
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/landlord/listings')
  revalidatePath('/listings')
  return { success: true }
}

export async function getPublicListings(filters?: {
  location?: string
  propertyType?: string
  minRent?: number
  maxRent?: number
  bedrooms?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('property_listings')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.location) {
    query = query.ilike('location_area', `%${filters.location}%`)
  }
  if (filters?.propertyType) {
    query = query.eq('property_type', filters.propertyType)
  }
  if (filters?.minRent) {
    query = query.gte('rent_amount', filters.minRent)
  }
  if (filters?.maxRent) {
    query = query.lte('rent_amount', filters.maxRent)
  }
  if (filters?.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms)
  }

  const { data, error } = await query.limit(50)
  if (error) return []
  return data ?? []
}

export async function getLandlordListings() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('property_listings')
    .select('*')
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
