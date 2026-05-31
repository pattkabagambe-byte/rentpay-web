import { createClient } from '@/supabase/server'
import {
  Building2,
  Users,
  CreditCard,
  Hammer,
  TrendingUp,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { copy } from '@/lib/copy'
import Link from 'next/link'

export default async function LandlordDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)

  const { count: occupiedCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user?.id)
    .eq('status', 'occupied')

  const { data: dueInvoices } = await supabase
    .from('invoices')
    .select('amount_due')
    .eq('landlord_id', user?.id)
    .in('status', ['due', 'overdue'])

  const rentDue = dueInvoices?.reduce((acc, curr) => acc + Number(curr.amount_due), 0) || 0

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('landlord_id', user?.id)
    .eq('status', 'completed')

  const paymentsReceived = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  const { count: maintenanceCount } = await supabase
    .from('maintenance_issues')
    .select('*', { count: 'exact', head: true })
    .eq('landlord_id', user?.id)
    .neq('status', 'resolved')

  return (
    <div className="space-y-10 md:space-y-12">
      <PageHeader
        title={copy.landlord.overview}
        description={copy.landlord.overviewDesc}
      />

      <StatCardGrid>
        <StatCard
          title="Total Properties"
          value={propertyCount || 0}
          icon={Building2}
          color="secondary"
          description="Buildings in your portfolio"
        />
        <StatCard
          title="Occupied Units"
          value={occupiedCount || 0}
          icon={Users}
          color="accent"
          description="Active tenancies"
        />
        <StatCard
          title="Rent Due"
          value={formatCurrency(rentDue)}
          icon={CreditCard}
          color="destructive"
          description={`${dueInvoices?.length || 0} unpaid invoice${(dueInvoices?.length || 0) !== 1 ? 's' : ''}`}
        />
        <StatCard
          title="Payments Received"
          value={formatCurrency(paymentsReceived)}
          icon={TrendingUp}
          color="primary"
          description="Total collected via RentPilot"
        />
        <StatCard
          title="Maintenance Requests"
          value={maintenanceCount || 0}
          icon={Hammer}
          color="secondary"
          description="Open issues to resolve"
        />
      </StatCardGrid>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        <Card variant="dashed" className="flex flex-col items-center justify-center min-h-[280px] md:min-h-[350px] text-center group hover:border-primary/30 transition-all">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
            <MessageSquare className="text-muted-foreground group-hover:text-primary transition-colors" size={32} aria-hidden="true" />
          </div>
          <h2 className="font-black text-xl md:text-2xl mb-2">Tenant Messages</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-8 font-medium">
            Stay in touch with your tenants across Kampala and beyond.
          </p>
          <Link
            href="/messages"
            className="bg-foreground text-background px-8 md:px-10 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            Open Messages <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>

        <Card variant="dashed" className="flex flex-col items-center justify-center min-h-[280px] md:min-h-[350px] text-center group hover:border-accent/30 transition-all">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
            <Building2 className="text-muted-foreground group-hover:text-accent transition-colors" size={32} aria-hidden="true" />
          </div>
          <h2 className="font-black text-xl md:text-2xl mb-2">Manage Properties</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-8 font-medium">
            Add units, set rent in UGX, and track NWSC & UEDCL accounts.
          </p>
          <Link
            href="/landlord/properties"
            className="bg-foreground text-background px-8 md:px-10 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            View Portfolio <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Card>
      </div>
    </div>
  )
}
