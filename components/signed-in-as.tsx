interface SignedInAsProps {
  label: string
  className?: string
}

export function SignedInAs({ label, className }: SignedInAsProps) {
  return (
    <p
      className={
        className ??
        'text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full'
      }
    >
      Signed in as <span className="font-black">{label}</span>
    </p>
  )
}
