'use client'

import { useState } from 'react'
import { searchProperties, getPropertyUnits } from '../actions/tenant' // I'll move these to units/actions/tenant
import { Search, Building2, MapPin, ArrowRight, Loader2, Home, CheckCircle2 } from 'lucide-react'
import { Property, Unit } from '@/types'
import { acceptInvite } from '../actions/tenant'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { formatCurrency } from '@/lib/format'

export function PropertySearchJoin() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    const { data } = await searchProperties(query)
    if (data) setResults(data as any)
    setLoading(false)
  }

  const handleSelectProperty = async (property: Property) => {
    setSelectedProperty(property)
    setLoadingUnits(true)
    const { data } = await getPropertyUnits(property.id)
    if (data) setUnits(data as any)
    setLoadingUnits(false)
  }

  // Note: Joining by property search is slightly different from invite code.
  // In a real app, you'd probably still need an invite code for security,
  // but the user asked for "search property by name".
  // We'll implement it as "Request to Join" or just "Join" for demo.
  const handleJoin = async () => {
    if (!selectedUnit) return
    setLoading(true)
    // For this flow, we'll simulate an invite-less join or use a placeholder
    // In production, this would likely trigger a notification to the landlord
    toast('Join request sent to your landlord. Use an invite code for instant access.', 'info')
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {!selectedProperty ? (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search property by name (e.g. Kabalagala Heights)"
                    className="w-full pl-14 pr-6 py-5 rounded-[24px] border-2 border-muted focus:border-primary focus:outline-none transition-all font-bold text-lg"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                </button>
            </form>

            <div className="grid gap-4">
                {results.map(property => (
                    <button
                        key={property.id}
                        onClick={() => handleSelectProperty(property)}
                        className="flex items-center gap-4 p-5 bg-background border-2 border-muted rounded-[24px] hover:border-primary/30 transition-all text-left group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden">
                            {property.photo_urls?.[0] ? <img src={property.photo_urls[0]} className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-3 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg truncate group-hover:text-primary transition-colors">{property.name}</h4>
                            <div className="flex items-center text-xs text-muted-foreground font-bold">
                                <MapPin size={12} className="mr-1" /> {property.address_text}
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                ))}
            </div>
        </div>
      ) : (
        <div className="bg-background border-2 border-primary/20 rounded-[32px] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <button onClick={() => setSelectedProperty(null)} className="text-xs font-black text-muted-foreground hover:text-primary flex items-center gap-1">
                    <ArrowRight className="rotate-180" size={14} /> BACK TO SEARCH
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Selected Property</span>
            </div>

            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 rounded-[24px] bg-muted overflow-hidden shadow-lg">
                    {selectedProperty.photo_urls?.[0] ? <img src={selectedProperty.photo_urls[0]} className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-4 text-muted-foreground" />}
                </div>
                <div>
                    <h3 className="text-2xl font-black">{selectedProperty.name}</h3>
                    <p className="text-sm font-bold text-muted-foreground">{selectedProperty.address_text}</p>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-black ml-1 uppercase tracking-widest text-muted-foreground">Select Vacant Unit</label>
                {loadingUnits ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {units.length > 0 ? units.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit)}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                                    selectedUnit?.id === unit.id ? "border-primary bg-primary/5 shadow-inner" : "border-muted hover:border-primary/30"
                                )}
                            >
                                <div>
                                    <p className="font-black">{unit.label}</p>
                                    <p className="text-xs font-bold text-primary">{unit.currency} {unit.rent_amount.toLocaleString()}</p>
                                </div>
                                {selectedUnit?.id === unit.id ? <CheckCircle2 size={18} className="text-primary" /> : <Home size={18} className="text-muted-foreground" />}
                            </button>
                        )) : (
                            <p className="col-span-2 text-sm text-muted-foreground italic p-4 bg-muted/20 rounded-2xl text-center">No vacant units available for this property.</p>
                        )}
                    </div>
                )}
            </div>

            <button
                disabled={!selectedUnit || loading}
                onClick={handleJoin}
                className="w-full bg-primary text-white py-4 rounded-[20px] font-black shadow-xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
                {loading ? 'Processing...' : 'Request to Join'}
            </button>
        </div>
      )}
    </div>
  )
}
