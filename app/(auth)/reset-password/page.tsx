'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { resetPasswordSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validation = validateForm(resetPasswordSchema, { password, confirmPassword })
    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.updateUser({
      password: validation.data.password,
    })

    if (authError) {
      setError('Could not update password. Your reset link may have expired.')
      toast('Password update failed.', 'error')
      setLoading(false)
    } else {
      toast('Password updated successfully.', 'success')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-black tracking-tight">Set new password</h2>
        <p className="mt-2 text-sm text-muted-foreground font-medium">
          Choose a strong password with at least 8 characters.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleUpdate} noValidate>
        {error && <FormErrorBanner message={error} />}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold">New password</label>
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
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-bold">Confirm password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors({}) }}
              placeholder="Repeat your password"
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Update password
        </Button>
      </form>
    </>
  )
}
