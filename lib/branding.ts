// Centralized brand config — update this file to rebrand the product
export const brand = {
  name: 'RentPilot',
  tagline: 'Automate Rent. Manage Property Smarter.',
  taglineAlt: 'Your Property Operations Co-Pilot.',
  description: 'Collect rent via Mobile Money, manage properties, invoices, maintenance, and documents. Built for landlords and tenants across East Africa.',
  url: 'https://rentpay.cc',
  domain: 'rentpay.cc',
  locale: 'Built for East Africa',
  region: 'Uganda & East Africa',
  company: 'Potentia-Motus Ventures',
  supportEmail: 'support@rentpay.cc',
  whatsapp: '+256700000000',
  whatsappUrl: 'https://wa.me/256700000000',
  logoLetter: 'R',
  themeColor: '#10b981',
  social: {
    twitter: '@rentpilot_ug',
  },
  meta: {
    titleDefault: 'RentPilot — Property Management & Rent Automation for East Africa',
    titleTemplate: '%s | RentPilot',
    description: 'Automate rent collection via Mobile Money, manage tenancies, track maintenance, and store documents. Built for landlords and tenants across Uganda and East Africa.',
    ogTitle: 'RentPilot — Property Management for East Africa',
    ogDescription: 'Automate rent. Manage property smarter. MTN & Airtel Mobile Money payments.',
    twitterTitle: 'RentPilot — Rent Automation for East Africa',
    twitterDescription: 'Collect rent via Mobile Money. Manage properties and tenancies across Uganda.',
    keywords: ['rent', 'Uganda', 'East Africa', 'landlord', 'tenant', 'property management', 'Mobile Money', 'Kampala', 'RentPilot', 'rent automation'],
  },
} as const

export type Brand = typeof brand
