import { Receipt } from 'lucide-react'
import { DataCard } from './data-card'
import { StatusBadge } from './badge'
import { MoneyDisplay } from './money-display'
import { DateDisplay } from './date-display'

interface InvoiceCardProps {
  id: string
  periodFrom: string
  dueDate: string
  amount: number
  currency?: string
  status: string
  propertyName: string
  unitLabel: string
}

export function InvoiceCard({
  id,
  periodFrom,
  dueDate,
  amount,
  currency = 'UGX',
  status,
  propertyName,
  unitLabel,
}: InvoiceCardProps) {
  return (
    <DataCard
      href={`/tenant/invoices/${id}`}
      icon={Receipt}
      iconClassName="bg-primary/10 text-primary"
      title={<DateDisplay value={periodFrom} variant="month" />}
      subtitle={`${propertyName} • ${unitLabel}`}
      badge={<StatusBadge status={status} type="invoice" />}
      trailing={
        <div className="text-right space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due</p>
          <DateDisplay value={dueDate} className="text-sm" />
          <MoneyDisplay amount={amount} currency={currency} size="lg" emphasis="primary" className="block mt-1" />
        </div>
      }
    />
  )
}
