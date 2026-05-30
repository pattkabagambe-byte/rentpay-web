import { describe, it, expect } from 'vitest'
import { formatPhoneUG, normalizePhoneUG, isValidPhoneUG, formatCurrency } from '@/lib/format'

describe('format utilities', () => {
  it('formats UGX currency', () => {
    expect(formatCurrency(850000)).toMatch(/850/)
  })

  it('normalizes Uganda phone numbers', () => {
    expect(normalizePhoneUG('0700123456')).toBe('+256700123456')
    expect(normalizePhoneUG('+256700123456')).toBe('+256700123456')
    expect(normalizePhoneUG('700123456')).toBe('+256700123456')
  })

  it('validates Uganda phone numbers', () => {
    expect(isValidPhoneUG('0700123456')).toBe(true)
    expect(isValidPhoneUG('123')).toBe(false)
  })

  it('formats phone for display', () => {
    expect(formatPhoneUG('0700123456')).toContain('0700')
  })
})
