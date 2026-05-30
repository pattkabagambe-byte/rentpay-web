import { PageHeader } from '@/components/ui/page-header'
import { UraTaxCalculator } from '@/features/landlord/components/ura-tax-calculator'

export default function UraTaxCalculatorPage() {
  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="URA Tax Estimator"
        description="Estimate your rental income tax according to Uganda Revenue Authority standards."
      />
      <UraTaxCalculator />
    </div>
  )
}
