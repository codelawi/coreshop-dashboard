import { Loader2 } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalyticsRevenue } from '@/hooks/api/use-analytics'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface RevenuePoint {
  month: number
  total: string | number
}

function compact(n: number) {
  if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M` }
  if (n >= 1_000) { return `${(n / 1_000).toFixed(1)}K` }
  return n.toFixed(0)
}

export function Overview() {
  const { data, isLoading } = useAnalyticsRevenue()

  const apiData: RevenuePoint[] = data?.data ?? []
  const byMonth = new Map<number, number>()
  apiData.forEach((p) => { byMonth.set(Number(p.month), Number(p.total)) })

  const chartData = MONTH_NAMES.map((name, idx) => ({
    name,
    revenue: byMonth.get(idx + 1) ?? 0,
  }))

  const maxVal = Math.max(...chartData.map((d) => d.revenue), 1)
  const hasData = chartData.some((d) => d.revenue > 0)

  if (isLoading) {
    return (
      <div className='flex h-80 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='relative'>
      {!hasData && (
        <div className='absolute inset-0 z-10 flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>No revenue data yet</p>
        </div>
      )}
      <ResponsiveContainer width='100%' height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='rev-gradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#22c55e' stopOpacity={0.3} />
              <stop offset='100%' stopColor='#22c55e' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='var(--color-border)'
            vertical={false}
          />
          <XAxis
            dataKey='name'
            stroke='var(--color-muted-foreground)'
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke='var(--color-muted-foreground)'
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `JOD ${compact(v)}`}
            width={68}
            domain={[0, maxVal * 1.15]}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              color: 'var(--color-popover-foreground)',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
            formatter={(value) => [
              `JOD ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              'Revenue',
            ]}
            cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 2' }}
          />
          <Area
            type='monotone'
            dataKey='revenue'
            stroke='#22c55e'
            strokeWidth={2.5}
            fill='url(#rev-gradient)'
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
