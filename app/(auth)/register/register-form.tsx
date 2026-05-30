'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { registerSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'landlord' ? 'landlord' : 'tenant'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black">Check your email</h2>
        <p className="text-muted-foreground font-medium">
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
          Click the link to activate your RentPay account.
        </p>
        <Link href="/login" className="inline-block text-primary font-bold hover:underline">Back to sign in</Link>
      </div>
    )
  }

  return (
    <>
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-black">R</span>
        </div>
        <span className="font-black text-xl">RentPay</span>
      </div>
      <div>
        <h2 className="text-3xl font-black tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-black text-primary hover:underline">Sign in</Link>
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleRegister} noValidate>
        {error && <FormErrorBanner message={error} />}

        <div className="space-y-2">
          <label className="text-sm font-bold">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {(['landlord', 'tenant'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all',
                  role === r
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted hover:border-primary/30'
                )}
              >
                {r === 'landlord' ? <Building2 size={18} /> : <User size={18} />}
                {r === 'landlord' ? 'Landlord' : 'Tenant'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-bold">Full name</label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors({}) }}
              placeholder="Jane Nakato"
              error={fieldErrors.full_name}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold">Email</label>
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
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors({}) }}
              placeholder="At least 8 characters"
              error={fieldErrors.password}
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Create account
        </Button>

        <p className="text-xs text-muted-foreground text-center font-medium">
          By signing up you agree to our terms of service and privacy policy.
        </p>
      </form>
    </>
  )
}
