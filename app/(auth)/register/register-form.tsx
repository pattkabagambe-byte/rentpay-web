'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LEGAL_PATHS } from '@/lib/legal-urls'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { registerSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2, Building2, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'landlord' ? 'landlord' : 'tenant'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [role, setRole] = useState<UserRole>(initialRole)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const paramRole = searchParams.get('role')
    if (paramRole === 'landlord' || paramRole === 'tenant') {
      setRole(paramRole)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' })
      setError('Please make sure your passwords match.')
      return
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    const validation = validateForm(registerSchema, { full_name: fullName, email, password, role })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: validation.data.full_name,
          intended_role: validation.data.role ?? role,
        },
      },
    })

    if (authError) {
      setError(authError.message.includes('already registered')
        ? 'An account with this email already exists. Try signing in.'
        : 'Could not create account. Please try again.')
      toast('Registration failed.', 'error')
      setLoading(false)
      return
    }

    if (data.session) {
      await supabase.from('profiles').update({
        full_name: validation.data.full_name,
        roles: [validation.data.role ?? role],
        active_mode: validation.data.role ?? role,
      }).eq('id', data.user!.id)

      toast('Account created! Complete your profile next.', 'success')
      router.push('/onboarding')
      router.refresh()
      return
    }

    setSuccess(true)
    toast('Check your email to confirm your account.', 'success')
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center">
          <CheckCircle2 size={32} className="text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Check your email</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            We sent a confirmation link to{' '}
            <strong className="text-foreground">{email}</strong>.
            Click the link to activate your RentPay account.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-primary font-bold hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-white font-black text-lg leading-none">R</span>
        </div>
        <span className="font-black text-2xl tracking-tight">RentPay</span>
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-black text-primary hover:underline">Sign in</Link>
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleRegister} noValidate>
        {error && <FormErrorBanner message={error} />}

        {/* Role toggle */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {(['landlord', 'tenant'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 font-bold text-sm transition-all',
                  role === r
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-muted hover:border-primary/30 text-muted-foreground'
                )}
                aria-pressed={role === r}
              >
                {r === 'landlord' ? <Building2 size={22} aria-hidden="true" /> : <User size={22} aria-hidden="true" />}
                <span>{r === 'landlord' ? 'Landlord' : 'Tenant'}</span>
                {role === r && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center" aria-hidden="true">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-sm font-bold">Full name</label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors({}) }}
              placeholder="Jane Nakato"
              error={fieldErrors.full_name}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-bold">Email address</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors({}) }}
              placeholder="you@example.com"
              error={fieldErrors.email}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-bold">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors({}) }}
                placeholder="At least 8 characters"
                error={fieldErrors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="text-sm font-bold">Confirm password</label>
            <Input
              id="confirm_password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors({}) }}
              placeholder="••••••••"
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="sr-only"
              aria-label="Accept terms"
            />
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                termsAccepted
                  ? 'bg-primary border-primary'
                  : 'border-muted group-hover:border-primary/50'
              )}
              aria-hidden="true"
            >
              {termsAccepted && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium leading-relaxed">
            I agree to RentPay&apos;s{' '}
            <Link href={LEGAL_PATHS.terms} className="text-primary font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href={LEGAL_PATHS.privacy} className="text-primary font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full h-12 text-base">
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </>
  )
}
