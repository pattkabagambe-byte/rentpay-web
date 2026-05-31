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
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md">
          <span className="text-white font-black text-lg leading-none">R</span>
        </div>
        <span className="font-black text-2xl tracking-tight">RentPilot</span>
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-black text-primary hover:underline">
            Create one free
          </Link>
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin} noValidate>
        {error && <FormErrorBanner message={error} />}

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-bold">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors({}) }}
              placeholder="you@example.com"
              error={fieldErrors.email}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-bold">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full h-12 text-base">
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        {/* Divider */}
        <div className="relative" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 font-bold text-muted-foreground tracking-wider">
              or
            </span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full h-12 gap-2.5 text-sm font-bold"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        {/* Legal */}
        <p className="text-xs text-muted-foreground text-center font-medium leading-relaxed">
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
