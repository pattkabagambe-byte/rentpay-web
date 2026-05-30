'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/supabase/client'
import { forgotPasswordSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(forgotPasswordSchema, { email })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (authError) {
      setError('Could not send reset link. Please try again.')
      toast('Reset link failed to send.', 'error')
    } else {
      setSent(true)
      toast('Reset link sent. Check your inbox.', 'success')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <MailCheck size={28} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black">Check your email</h2>
        <p className="text-muted-foreground font-medium">
          If an account exists for <strong className="text-foreground">{email}</strong>, you will receive a password reset link shortly.
        </p>
        <Link href="/login" className="inline-block text-primary font-bold hover:underline">Back to sign in</Link>
      </div>
    )
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-black tracking-tight">Reset your password</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleReset} noValidate>
        {error && <FormErrorBanner message={error} />}
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Send reset link
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm font-bold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </>
  )
}
