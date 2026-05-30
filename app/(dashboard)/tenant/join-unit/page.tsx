import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { LinkPropertyForm } from '@/features/units/components/link-property-form'
import { PropertySearchJoin } from '@/features/units/components/property-search-join'

export default async function JoinUnitPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tenancy } = await supabase
    .from('tenancies')
    .select('id')
    .eq('tenant_id', user.id)
    .eq('status', 'active')
    .single()

  if (tenancy) {
    redirect('/tenant')
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <PageHeader
        title="Find your home"
        description="Link your account to your rental unit using an invite code or by searching."
      />

      <div className="grid gap-12">
        <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-primary text-center">Option 1: Invite Code</h2>
            <LinkPropertyForm />
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/20 px-4 py-1 rounded-full font-black text-muted-foreground border-2 border-muted-foreground/10">OR</span>
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-accent text-center">Option 2: Search Property</h2>
            <PropertySearchJoin />
        </div>
      </div>
    </div>
  )
}
