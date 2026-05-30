'use client'

import { useState, useEffect } from 'react'
import {
  Info,
  Calculator,
  Building2,
  User,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/ui/money-display'

const URA_RENTAL_TAX_GUIDE = 'https://www.ura.go.ug/en/tax-education/rental-income-tax/'

export function UraTaxCalculator() {
  const [grossIncome, setGrossIncome] = useState<number | ''>('')
  const [isIndividual, setIsIndividual] = useState(true)
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [copied, setCopied] = useState(false)

  const INDIVIDUAL_THRESHOLD = 2820000
  const INDIVIDUAL_RATE = 0.12
  const COMPANY_EXPENSE_CAP_RATE = 0.75
  const COMPANY_TAX_RATE = 0.30

  const [results, setResults] = useState({
    gross: 0,
    allowableDeductions: 0,
    chargeableIncome: 0,
    taxPayable: 0,
    effectiveRate: 0,
  })

  useEffect(() => {
    const inputAmount = Number(grossIncome) || 0
    const annualGross = period === 'monthly' ? inputAmount * 12 : inputAmount

    let tax = 0
    let deductions = 0
    let chargeable = 0

    if (isIndividual) {
      chargeable = Math.max(0, annualGross - INDIVIDUAL_THRESHOLD)
      deductions = annualGross > INDIVIDUAL_THRESHOLD ? INDIVIDUAL_THRESHOLD : annualGross
      tax = chargeable * INDIVIDUAL_RATE
    } else {
      deductions = annualGross * COMPANY_EXPENSE_CAP_RATE
      chargeable = annualGross - deductions
      tax = chargeable * COMPANY_TAX_RATE
    }

    setResults({
      gross: annualGross,
      allowableDeductions: deductions,
      chargeableIncome: chargeable,
      taxPayable: tax,
      effectiveRate: annualGross > 0 ? (tax / annualGross) * 100 : 0,
    })
  }, [grossIncome, isIndividual, period])

  const handleCopy = () => {
    const text = `URA Rental Tax Estimate\nGross: UGX ${results.gross.toLocaleString()}\nTax Payable: UGX ${results.taxPayable.toLocaleString()}\nEffective Rate: ${results.effectiveRate.toFixed(1)}%`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-8">
        <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-8 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Filing entity</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsIndividual(true)}
                  className={cn(
                    'flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-sm',
                    isIndividual ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/10 border-transparent text-muted-foreground'
                  )}
                >
                  <User size={18} />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setIsIndividual(false)}
                  className={cn(
                    'flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-sm',
                    !isIndividual ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/10 border-transparent text-muted-foreground'
                  )}
                >
                  <Building2 size={18} />
                  Company
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rental income</label>
                <div className="flex bg-muted/20 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPeriod('monthly')}
                    className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all', period === 'monthly' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground')}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('annual')}
                    className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all', period === 'annual' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground')}
                  >
                    Annual
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-14 pr-6 py-6 rounded-[24px] border-2 border-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-2xl"
                  placeholder="0"
                  aria-label="Rental income amount in UGX"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground opacity-30 text-xl">UGX</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-accent/5 rounded-3xl border border-accent/20 flex gap-4">
            <Info className="text-accent shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-black text-accent uppercase tracking-widest">Tax rule summary</p>
              <p className="text-xs font-medium text-accent/80 leading-relaxed">
                {isIndividual
                  ? 'Individuals pay 12% on gross rental income after a tax-free threshold of UGX 2,820,000 per annum.'
                  : 'Companies pay 30% on gross income after a fixed 75% expense deduction cap.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-2 border-dashed border-muted rounded-[40px] space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle size={20} aria-hidden="true" />
            <h4 className="font-black text-sm uppercase tracking-widest">Legal disclaimer</h4>
          </div>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
            This calculator provides an unofficial estimate based on standard URA tax rates. Consult a certified tax advisor or visit the URA portal for official filings.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-foreground text-background rounded-[40px] p-10 shadow-2xl space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
            <Calculator size={200} aria-hidden="true" />
          </div>

          <div className="relative z-10 space-y-2">
            <p className="text-sm font-black uppercase tracking-widest opacity-60">Estimated annual tax</p>
            <MoneyDisplay amount={results.taxPayable} currency="UGX" size="xl" className="text-background" />
          </div>

          <div className="relative z-10 grid gap-6 pt-10 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Annual gross income</span>
              <span className="font-black">UGX {results.gross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Allowable deductions</span>
              <span className="font-black text-primary">- UGX {results.allowableDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Chargeable income</span>
              <span className="font-black">UGX {results.chargeableIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" aria-hidden="true" />
                <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Effective rate</span>
              </div>
              <span className="font-black text-primary text-xl">{results.effectiveRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="relative z-10 flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy estimate'}
            </button>
            <a
              href={URA_RENTAL_TAX_GUIDE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              URA guide
            </a>
          </div>
        </div>

        <div className="bg-background border-2 border-muted/50 rounded-[40px] p-8 space-y-6">
          <h3 className="text-xl font-black">Monthly breakdown</h3>
          <div className="flex justify-between items-center p-6 bg-muted/20 rounded-3xl">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly tax</p>
              <p className="text-2xl font-black">UGX {(results.taxPayable / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Take home</p>
              <p className="text-2xl font-black text-primary">UGX {((results.gross - results.taxPayable) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
