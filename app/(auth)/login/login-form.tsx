'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { loginSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { LEGAL_PATHS } from '@/lib/legal-urls'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const authError = searchParams.get('error')
    if (authError) {
      setError(decodeURIComponent(authError))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(loginSchema, { email, password })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword(validation.data)

    if (authError) {
      setError('Invalid email or password. Please try again.')
      toast('Sign in failed. Check your credentials.', 'error')
      setLoading(false)
    } else {
      toast('Welcome back!', 'success')
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
        <h2 className="text-3xl font-black tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-black text-primary hover:underline">Sign up</Link>
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleLogin} noValidate>
        {error && <FormErrorBanner message={error} />}
        <div className="space-y-4">
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
              placeholder="••••••••"
              error={fieldErrors.password}
              autoComplete="current-password"
            />
          </div>
        </div>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Sign in
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 font-bold text-muted-foreground">Or</span>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={handleGoogleLogin} className="w-full">
          Continue with Google
        </Button>
        <p className="text-xs text-muted-foreground text-center font-medium">
          By continuing you agree to our{' '}
          <Link href={LEGAL_PATHS.terms} className="text-primary font-bold hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href={LEGAL_PATHS.privacy} className="text-primary font-bold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </>
  )
}
