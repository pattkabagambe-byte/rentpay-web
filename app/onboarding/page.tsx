'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/supabase/client'
import { onboardingSchema } from '@/lib/zod-schemas'
import { validateForm } from '@/lib/validate'
import { normalizePhoneUG } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input, FormErrorBanner } from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { Loader2, Building2, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [roles, setRoles] = useState<UserRole[]>(['tenant'])
  const [activeMode, setActiveMode] = useState<UserRole>('tenant')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const intended = user.user_metadata?.intended_role as UserRole | undefined
      const name = user.user_metadata?.full_name as string | undefined
      if (name) setFullName(name)
      if (intended === 'landlord' || intended === 'tenant') {
        setRoles([intended])
        setActiveMode(intended)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, roles, active_mode')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) setFullName(profile.full_name)
      if (profile?.phone) setPhone(profile.phone)
      if (profile?.roles?.length) {
        setRoles(profile.roles as UserRole[])
        setActiveMode((profile.active_mode as UserRole) ?? profile.roles[0])
      }

      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedPhone = normalizePhoneUG(phone)
    const validation = validateForm(onboardingSchema, {
      full_name: fullName,
      phone: normalizedPhone,
      role: activeMode,
    })

    if (!validation.success) {
      setFieldErrors(validation.errors)
      setError(validation.message)
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: validation.data.full_name,
        phone: validation.data.phone,
        roles: roles.length ? roles : [validation.data.role],
        active_mode: activeMode,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Could not save your profile. Please try again.')
      toast('Profile setup failed.', 'error')
      setSubmitting(false)
    } else {
      toast('Profile complete!', 'success')
      if (activeMode === 'tenant') {
        router.push('/tenant/onboarding')
      } else {
        router.push('/landlord')
      }
      router.refresh()
    }
  }

  const toggleRole = (role: UserRole) => {
    if (roles.includes(role)) {
      if (roles.length > 1) {
        const next = roles.filter((r) => r !== role)
        setRoles(next)
        if (activeMode === role) setActiveMode(next[0])
      }
    } else {
      setRoles([...roles, role])
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-background p-8 md:p-10 rounded-[32px] shadow-xl border-2 border-muted/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <User size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Complete your profile</h2>
          <p className="text-sm text-muted-foreground font-medium">
            A few details to personalize your RentPay experience in Uganda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && <FormErrorBanner message={error} />}

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
              <label htmlFor="phone" className="text-sm font-bold flex items-center gap-1">
                <Phone size={14} /> Phone (Uganda)
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFieldErrors({}) }}
                placeholder="0700 123 456"
                error={fieldErrors.phone}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">I use RentPay as</label>
              <div className="grid grid-cols-2 gap-3">
                {(['tenant', 'landlord'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all',
                      roles.includes(role)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:border-primary/30 opacity-60'
                    )}
                  >
                    {role === 'landlord' ? <Building2 size={18} /> : <User size={18} />}
                    {role === 'landlord' ? 'Landlord' : 'Tenant'}
                  </button>
                ))}
              </div>
            </div>

            {roles.length > 1 && (
              <div className="space-y-2">
                <label htmlFor="active_mode" className="text-sm font-bold">Default dashboard</label>
                <select
                  id="active_mode"
                  value={activeMode}
                  onChange={(e) => setActiveMode(e.target.value as UserRole)}
                  className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="animate-spin" size={18} />}
            Get started
          </Button>
        </form>

        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
          Powered by Potentia-Motus Ventures
        </p>
      </div>
    </div>
  )
}
