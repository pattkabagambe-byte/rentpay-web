'use client'

import { useState } from 'react'
import { acceptInvite } from '../actions/tenant'
import { Home, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { inviteCodeSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { copy } from '@/lib/copy'

export function LinkPropertyForm() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateForm(inviteCodeSchema, { code: code.trim() })
    if (!validation.success) {
      setFieldError(validation.message)
      setError(validation.message)
      return
    }

    setLoading(true)
    setError(null)
    setFieldError(null)

    const result = await acceptInvite(validation.data.code)

    if (result.error) {
      setError(result.error)
      toast(result.error, 'error')
      setLoading(false)
    } else {
      toast('Property linked successfully!', 'success')
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 2000)
    }
  }

  if (success) {
    return (
      <Card className="flex flex-col items-center gap-4 text-center border-primary/20 shadow-lg shadow-primary/5">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="text-primary w-8 h-8" aria-hidden="true" />
        </div>
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-primary">Welcome Home!</h3>
        <p className="text-muted-foreground font-medium text-sm">Your unit is linked. You can now pay rent and manage your tenancy.</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col items-center gap-6 text-center border-primary/10">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Home className="text-primary w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">{copy.tenancy.noTenancy}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto font-medium text-sm">{copy.tenancy.linkProperty}</p>
      </div>

      <form onSubmit={handleLink} className="w-full max-w-md space-y-4" noValidate>
        {error && <FormErrorBanner message={error} />}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            id="invite-code"
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setFieldError(null) }}
            placeholder="ENTER CODE (e.g. AB12CD)"
            className="flex-1 font-mono font-bold text-center tracking-widest"
            error={fieldError ?? undefined}
            aria-label="Property invite code"
          />
          <Button type="submit" disabled={loading || !code} className="sm:shrink-0">
            {loading && <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />}
            Link Property
          </Button>
        </div>
      </form>
    </Card>
  )
}
