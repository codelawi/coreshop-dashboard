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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const tooltipStyle = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-popover-foreground)',
  borderRadius: '8px',
  fontSize: '12px',
}

interface ApiPoint {
  month: number
  total: string | number
}

export function RevenueChart() {
  const { data, isLoading } = useAnalyticsRevenue()
  const apiData: ApiPoint[] = data?.data ?? []
  const byMonth = new Map<number, number>()
  apiData.forEach((p) => byMonth.set(Number(p.month), Number(p.total)))

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    revenue: byMonth.get(i + 1) ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>Monthly revenue for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-chart-1)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-chart-1)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--color-border)' />
              <XAxis
                dataKey='month'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
                tickFormatter={(v) => `JOD ${v}`}
              />
              <Tooltip
                formatter={(v) => [`JOD ${v}`, 'Revenue']}
                contentStyle={tooltipStyle}
              />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='var(--color-chart-1)'
                fill='url(#revenueGradient)'
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
