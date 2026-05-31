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
import { Loader2, Building2, User, Phone, CheckCircle2, ArrowRight, ArrowLeft, Home, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import { getSignedInLabel } from '@/lib/auth-display'
import { SignedInAs } from '@/components/signed-in-as'

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Your role' },
  { id: 2, label: 'Your profile' },
  { id: 3, label: 'Get started' },
]

// ─── Step 1: Role selection ──────────────────────────────────────────────────
function RoleStep({
  roles,
  activeMode,
  onToggleRole,
  onSetActiveMode,
}: {
  roles: UserRole[]
  activeMode: UserRole
  onToggleRole: (r: UserRole) => void
  onSetActiveMode: (r: UserRole) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center">
          <User size={28} className="text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">How will you use RentPilot?</h2>
        <p className="text-sm text-muted-foreground font-medium">
          Choose one or both — you can switch at any time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['landlord', 'tenant'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onToggleRole(role)}
            className={cn(
              'relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 font-bold text-sm transition-all',
              roles.includes(role)
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-muted hover:border-primary/30 text-muted-foreground'
            )}
            aria-pressed={roles.includes(role)}
          >
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              roles.includes(role) ? 'bg-primary/20' : 'bg-muted/60'
            )}>
              {role === 'landlord'
                ? <Building2 size={28} aria-hidden="true" />
                : <Home size={28} aria-hidden="true" />
              }
            </div>
            <div className="text-center">
              <p className="font-black text-base">{role === 'landlord' ? 'Landlord' : 'Tenant'}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5 leading-snug">
                {role === 'landlord'
                  ? 'Manage properties & collect rent'
                  : 'Pay rent & manage tenancy'
                }
              </p>
            </div>
            {roles.includes(role) && (
              <span
                className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {roles.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-bold">Default dashboard</label>
          <div className="grid grid-cols-2 gap-3">
            {(['tenant', 'landlord'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSetActiveMode(mode)}
                className={cn(
                  'py-3 rounded-2xl border-2 font-bold text-sm transition-all',
                  activeMode === mode
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted text-muted-foreground hover:border-primary/30'
                )}
                aria-pressed={activeMode === mode}
              >
                Open as {mode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 2: Profile details ─────────────────────────────────────────────────
function ProfileStep({
  fullName,
  phone,
  activeMode,
  fieldErrors,
  onFullNameChange,
  onPhoneChange,
}: {
  fullName: string
  phone: string
  activeMode: UserRole
  fieldErrors: Record<string, string>
  onFullNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center">
          <Phone size={28} className="text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">Complete your profile</h2>
        <p className="text-sm text-muted-foreground font-medium">
          A few details so your {activeMode === 'landlord' ? 'tenants' : 'landlord'} can reach you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-bold">Full name</label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Jane Nakato"
            error={fieldErrors.full_name}
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-bold flex items-center gap-1.5">
            <Phone size={13} aria-hidden="true" />
            Phone number (Uganda)
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="0700 123 456"
            error={fieldErrors.phone}
            autoComplete="tel"
          />
          <p className="text-xs text-muted-foreground font-medium">
            Used for MTN or Airtel Mobile Money payments.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Next action ─────────────────────────────────────────────────────
function GetStartedStep({ activeMode, fullName }: { activeMode: UserRole; fullName: string }) {
  const firstName = fullName.split(' ')[0] || 'there'
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center">
          <CheckCircle2 size={36} className="text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">
          You&apos;re all set, {firstName}!
        </h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          {activeMode === 'landlord'
            ? 'Next, add your first property so tenants can find and pay their rent.'
            : 'Next, use your invite code to join a unit and start paying rent easily.'
          }
        </p>
      </div>

      <div className={cn(
        'rounded-3xl p-6 text-left space-y-3',
        activeMode === 'landlord' ? 'bg-primary/5 border-2 border-primary/20' : 'bg-blue-50 border-2 border-blue-100'
      )}>
        <div className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center',
          activeMode === 'landlord' ? 'bg-primary/15 text-primary' : 'bg-blue-100 text-blue-600'
        )}>
          {activeMode === 'landlord' ? <Building2 size={20} /> : <Key size={20} />}
        </div>
        <div>
          <p className="font-black text-sm">
            {activeMode === 'landlord' ? 'Add your first property' : 'Join a unit'}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-snug">
            {activeMode === 'landlord'
              ? 'Create properties and units, then invite your tenants to join.'
              : 'Your landlord will share an invite link or code to connect your tenancy.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Progress indicator ──────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      <div className="flex justify-between items-center">
        {STEPS.map((s) => (
          <div key={s.id} className="flex items-center gap-1">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all',
              s.id < step
                ? 'bg-primary text-white'
                : s.id === step
                ? 'bg-primary text-white ring-4 ring-primary/20'
                : 'bg-muted text-muted-foreground'
            )}>
              {s.id < step
                ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : s.id
              }
            </div>
            {s.id < total && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 w-12 sm:w-16 transition-all',
                s.id < step ? 'bg-primary' : 'bg-muted'
              )} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">
        Step {step} of {total} — {STEPS[step - 1].label}
      </p>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [signedInAs, setSignedInAs] = useState<string | null>(null)
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
      const name =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined)
      setSignedInAs(getSignedInLabel(user))
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

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!roles.length) {
        setError('Please select at least one role to continue.')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      // Validate profile fields before advancing
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
      setFieldErrors({})
      setStep(3)
      return
    }
  }

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
      setStep(2)
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
      toast('Profile complete! Welcome to RentPilot.', 'success')
      if (activeMode === 'tenant') {
        router.push('/tenant/onboarding')
      } else {
        router.push('/landlord')
      }
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} aria-label="Loading…" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/30 via-background to-primary/5 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg leading-none">R</span>
          </div>
          <span className="font-black text-2xl tracking-tight">RentPilot</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-[32px] shadow-xl border-2 border-muted/50 p-8 space-y-8">

          {/* Signed-in identity */}
          {signedInAs && (
            <div className="flex justify-center">
              <SignedInAs label={signedInAs} />
            </div>
          )}

          {/* Progress */}
          <ProgressBar step={step} total={STEPS.length} />

          {/* Step content */}
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="mb-4"><FormErrorBanner message={error} /></div>}

            {step === 1 && (
              <RoleStep
                roles={roles}
                activeMode={activeMode}
                onToggleRole={toggleRole}
                onSetActiveMode={setActiveMode}
              />
            )}

            {step === 2 && (
              <ProfileStep
                fullName={fullName}
                phone={phone}
                activeMode={activeMode}
                fieldErrors={fieldErrors}
                onFullNameChange={(v) => { setFullName(v); setFieldErrors({}) }}
                onPhoneChange={(v) => { setPhone(v); setFieldErrors({}) }}
              />
            )}

            {step === 3 && (
              <GetStartedStep activeMode={activeMode} fullName={fullName} />
            )}

            {/* Navigation */}
            <div className={cn('flex gap-3 mt-8', step > 1 ? 'justify-between' : 'justify-end')}>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep(step - 1); setError(null) }}
                  disabled={submitting}
                  className="gap-1.5"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-1.5 flex-1 sm:flex-none sm:min-w-[140px]"
                >
                  Continue
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-1.5 flex-1 sm:flex-none sm:min-w-[160px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    <>
                      Get started
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
          Powered by Potentia-Motus Ventures
        </p>
      </div>
    </div>
  )
}
