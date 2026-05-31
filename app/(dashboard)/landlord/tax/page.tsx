import { PageHeader } from '@/components/ui/page-header'
import { UraTaxCalculator } from '@/features/landlord/components/ura-tax-calculator'
import { Calculator, ExternalLink, Info } from 'lucide-react'

export default function UraTaxCalculatorPage() {
  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="URA Tax Estimator"
        description="Estimate your rental income tax according to Uganda Revenue Authority rates."
        icon={Calculator}
        divider
      />

      {/* Contextual info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-black text-amber-800">Unofficial estimate only</p>
          <p className="text-xs font-medium text-amber-700 leading-relaxed">
            This tool uses standard URA rental income tax rates. Results are for planning purposes — consult a certified tax advisor or file directly on the{' '}
            <a
              href="https://www.ura.go.ug"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black underline underline-offset-2 hover:text-amber-900 transition-colors inline-flex items-center gap-0.5"
            >
              URA portal <ExternalLink size={11} aria-hidden="true" />
            </a>
            .
          </p>
        </div>
      </div>

      <UraTaxCalculator />
    </div>
  )
}
