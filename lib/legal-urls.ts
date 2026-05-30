/** Canonical legal page paths (also served at https://rentpay.cc/privacy and /terms). */
export const LEGAL_PATHS = {
  privacy: '/privacy',
  terms: '/terms',
} as const

export const LEGAL_CANONICAL = {
  privacy: 'https://rentpay.cc/privacy',
  terms: 'https://rentpay.cc/terms',
} as const
