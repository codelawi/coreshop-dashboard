import { Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useAnalyticsRevenue } from '@/hooks/api/use-analytics'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

interface RevenuePoint {
  month: number
  total: string | number
}

const tooltipStyle = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-popover-foreground)',
  borderRadius: '8px',
  fontSize: '12px',
}

export function Overview() {
  const { data, isLoading } = useAnalyticsRevenue()

  const apiData: RevenuePoint[] = data?.data ?? []
  const byMonth = new Map<number, number>()
  apiData.forEach((p) => {
    byMonth.set(Number(p.month), Number(p.total))
  })

  const chartData = MONTH_NAMES.map((name, idx) => ({
    name,
    revenue: byMonth.get(idx + 1) ?? 0,
  }))

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='var(--color-muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='var(--color-muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `JOD ${value}`}
        />
        <Tooltip
          formatter={(value) => [`JOD ${Number(value).toFixed(2)}`, 'Revenue']}
          contentStyle={tooltipStyle}
        />
        <Bar
          dataKey='revenue'
          fill='var(--color-chart-1)'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
