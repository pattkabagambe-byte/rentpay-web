import { z } from 'zod'
import { isValidPhoneUG } from '@/lib/format'

export const propertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  address_text: z.string().min(5, 'Please enter a full address (e.g. Ggaba Road, Kampala)'),
  nwsc_account_number: z.string().optional(),
  uedcl_meter_number: z.string().optional(),
  water_meter_number: z.string().optional(),
  power_meter_number: z.string().optional(),
  rubbish_collection_account: z.string().optional(),
  tenancy_agreement_url: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  photo_urls: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
})

export const unitSchema = z.object({
  label: z.string().min(1, 'Unit label is required (e.g. Apt 4B)'),
  rent_amount: z.coerce.number().min(1, 'Rent amount must be greater than zero'),
  currency: z.enum(['UGX', 'USD', 'KES']),
  due_day: z.coerce.number().min(1, 'Due day must be between 1 and 31').max(31),
  grace_days: z.coerce.number().min(0).max(14, 'Grace period cannot exceed 14 days'),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
})

export const maintenanceSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Please describe the issue in more detail (at least 10 characters)'),
  photo_urls: z.array(z.string()).max(3, 'Maximum 3 photos allowed').optional(),
})

export const utilityBillSchema = z.object({
  type: z.enum(['water', 'power', 'rubbish']),
  amount: z.coerce.number().min(1, 'Amount must be greater than zero'),
  currency: z.enum(['UGX', 'USD', 'KES']).default('UGX'),
  notes: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['landlord', 'tenant']).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().refine(isValidPhoneUG, 'Enter a valid Uganda phone number (e.g. 0700123456)'),
  role: z.enum(['landlord', 'tenant']),
})

export const inviteCodeSchema = z.object({
  code: z.string().min(4, 'Enter a valid invite code'),
})

export const invoicePaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice'),
  method: z.enum(['mobile_money', 'card']),
  phone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.method === 'mobile_money') {
    if (!data.phone || !isValidPhoneUG(data.phone)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid Uganda mobile number (MTN or Airtel)',
        path: ['phone'],
      })
    }
  }
})

export const tenantOnboardingSchema = z.object({
  nin: z.string().min(14, 'Enter a valid National ID number (NIN)').max(20, 'NIN looks too long'),
  emergency_contact: z.string().min(5, 'Enter emergency contact name and phone'),
  preferred_payment_method: z.enum(['MTN Mobile Money', 'Airtel Money', 'Visa/Mastercard']),
  preferred_payment_date: z.coerce.number().min(1, 'Day must be 1–31').max(31),
  reminder_days: z.coerce.number().min(1, 'Reminder must be 1–14 days').max(14),
  id_front_url: z.string().min(1, 'Upload the front of your National ID'),
  id_back_url: z.string().min(1, 'Upload the back of your National ID'),
  terms_accepted: z.literal(true, { message: 'You must accept the tenancy terms to continue' }),
})
