/** Uganda/East Africa-focused copy used across RentPilot */

import { brand } from '@/lib/branding'

export const copy = {
  app: {
    name: brand.name,
    tagline: brand.tagline,
    locale: brand.locale,
  },
  currency: {
    default: 'UGX',
    label: 'Ugandan Shillings',
  },
  utilities: {
    nwsc: 'NWSC (Water)',
    uedcl: 'UEDCL / Yaka (Power)',
    rubbish: 'Rubbish Collection',
  },
  payment: {
    mobileMoney: 'MTN Mobile Money & Airtel Money',
    payNow: 'Pay Now',
    allSettled: 'All Clear!',
  },
  tenancy: {
    active: 'Active Tenancy',
    noTenancy: 'No active tenancy',
    linkProperty: 'Link your rental unit to get started.',
  },
  landlord: {
    overview: 'Portfolio Overview',
    overviewDesc: 'Your rental properties across East Africa at a glance.',
    noProperties: 'No properties yet',
    noPropertiesDesc: 'Add your first building in Kampala, Entebbe, or anywhere in East Africa.',
  },
  tenant: {
    home: 'My Home',
    homeDesc: 'Manage rent, utilities, and maintenance for your unit.',
    noInvoices: 'No invoices yet',
    noInvoicesDesc: 'Rent invoices appear here once your tenancy begins.',
  },
  maintenance: {
    report: 'Report an Issue',
    noIssues: 'No maintenance requests',
    noIssuesDesc: 'Report plumbing, power, or other issues with your unit.',
    urgent: 'For emergencies like burst pipes or electrical faults, call your landlord or 999 immediately.',
  },
  messages: {
    empty: 'No conversations yet',
    emptyDesc: 'Messages appear once you have an active tenancy with a landlord or tenant.',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    notFound: 'We could not find what you were looking for.',
    unauthorized: 'Please sign in to continue.',
  },
} as const
