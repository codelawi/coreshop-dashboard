type Period = 'monthly' | 'hourly'

interface PeriodToggleProps {
  period: Period
  onChange: (period: Period) => void
}

export function PeriodToggle({ period, onChange }: PeriodToggleProps) {
  return (
    <div className='flex overflow-hidden rounded-md border border-border'>
      {(['monthly', 'hourly'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 text-xs capitalize transition-colors ${
            period === p
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
