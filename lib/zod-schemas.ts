import { z } from 'zod'
import { isValidPhoneUG } from '@/lib/format'

// ─── Shared field validators ──────────────────────────────────────────────────

const ugPhone = z
  .string()
  .min(1, 'Phone number is required')
  .refine(isValidPhoneUG, 'Enter a valid Uganda phone number (e.g. 0700 123 456 or +256 700 123 456)')

// UGX amounts: positive, non-zero, reasonable upper limit (500M UGX)
const ugxAmount = z.coerce
  .number()
  .min(1, 'Amount must be greater than zero')
  .max(500_000_000, 'Amount cannot exceed UGX 500,000,000')

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const propertySchema = z.object({
  name: z
    .string()
    .min(3, 'Property name must be at least 3 characters')
    .max(100, 'Property name is too long'),
  address_text: z
    .string()
    .min(5, 'Enter a full address (e.g. Ggaba Road, Kampala, Uganda)'),
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
  label: z
    .string()
    .min(1, 'Unit label is required (e.g. Apt 4B, Room 3, Shop 2)'),
  rent_amount: ugxAmount,
  currency: z.enum(['UGX', 'USD', 'KES']),
  due_day: z.coerce
    .number()
    .min(1, 'Due day must be between 1 and 31')
    .max(31, 'Due day must be between 1 and 31'),
  grace_days: z.coerce
    .number()
    .min(0, 'Grace period cannot be negative')
    .max(14, 'Grace period cannot exceed 14 days'),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
})

export const maintenanceSchema = z.object({
  category: z
    .string()
    .min(1, 'Please select an issue category'),
  priority: z.enum(['low', 'normal', 'urgent']).default('normal'),
  description: z
    .string()
    .min(20, 'Please describe the issue in more detail (at least 20 characters)')
    .max(1000, 'Description is too long (max 1000 characters)'),
  photo_urls: z.array(z.string()).max(3, 'Maximum 3 photos allowed').optional(),
})

export const utilityBillSchema = z.object({
  type: z.enum(['water', 'power', 'rubbish']),
  amount: z.coerce
    .number()
    .min(1, 'Amount must be greater than zero')
    .max(10_000_000, 'Amount seems too large — please double-check'),
  currency: z.enum(['UGX', 'USD', 'KES']).default('UGX'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['landlord', 'tenant']).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: ugPhone,
  role: z.enum(['landlord', 'tenant'], {
    message: 'Select your role (Landlord or Tenant)',
  }),
})

export const inviteCodeSchema = z.object({
  code: z.string().min(4, 'Enter a valid invite code (at least 4 characters)'),
})

export const invoicePaymentSchema = z
  .object({
    invoiceId: z.string().uuid('Invalid invoice ID'),
    method: z.enum(['mobile_money', 'card'], {
      message: 'Select a payment method',
    }),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === 'mobile_money') {
      if (!data.phone || !data.phone.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter your Mobile Money number (MTN or Airtel Uganda)',
          path: ['phone'],
        })
      } else if (!isValidPhoneUG(data.phone)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid Uganda mobile number (e.g. 0700 123 456)',
          path: ['phone'],
        })
      }
    }
  })

export const tenantOnboardingSchema = z.object({
  nin: z
    .string()
    .min(14, 'Enter a valid National ID number (NIN) — should be 14 characters')
    .max(20, 'NIN looks too long — please check and re-enter'),
  emergency_contact: z
    .string()
    .min(5, 'Enter an emergency contact name and phone number'),
  preferred_payment_method: z.enum(['MTN Mobile Money', 'Airtel Money', 'Visa/Mastercard'], {
    message: 'Select a preferred payment method',
  }),
  preferred_payment_date: z.coerce
    .number()
    .min(1, 'Day must be between 1 and 31')
    .max(31, 'Day must be between 1 and 31'),
  reminder_days: z.coerce
    .number()
    .min(1, 'Reminder must be at least 1 day before')
    .max(14, 'Reminder cannot be more than 14 days before'),
  id_front_url: z.string().min(1, 'Upload the front of your National ID'),
  id_back_url: z.string().min(1, 'Upload the back of your National ID'),
  terms_accepted: z.literal(true, {
    message: 'You must accept the tenancy terms to continue',
  }),
})
