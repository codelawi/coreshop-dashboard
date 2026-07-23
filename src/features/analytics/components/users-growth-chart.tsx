import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalyticsUsers } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PeriodToggle } from './period-toggle'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`)

const tooltipStyle = {
  background: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-popover-foreground)',
  borderRadius: '8px',
  fontSize: '12px',
}

interface UserPoint {
  month?: number
  hour?: number
  role: string
  total: number
}

export function UsersGrowthChart() {
  const [period, setPeriod] = useState<'monthly' | 'hourly'>('monthly')
  const { data, isLoading } = useAnalyticsUsers(period)
  const points: UserPoint[] = data?.data ?? []

  let chartData: { label: string; clients: number; sellers: number }[]

  if (period === 'hourly') {
    const clientsByHour = new Map<number, number>()
    const sellersByHour = new Map<number, number>()
    points.forEach((p) => {
      const hour = Number(p.hour)
      const total = Number(p.total)
      if (p.role === 'client') { clientsByHour.set(hour, total) }
      if (p.role === 'seller') { sellersByHour.set(hour, total) }
    })
    chartData = HOURS.map((h, i) => ({
      label: h,
      clients: clientsByHour.get(i) ?? 0,
      sellers: sellersByHour.get(i) ?? 0,
    }))
  } else {
    const clientsByMonth = new Map<number, number>()
    const sellersByMonth = new Map<number, number>()
    points.forEach((p) => {
      const month = Number(p.month)
      const total = Number(p.total)
      if (p.role === 'client') { clientsByMonth.set(month, total) }
      if (p.role === 'seller') { sellersByMonth.set(month, total) }
    })
    chartData = MONTHS.map((m, i) => ({
      label: m,
      clients: clientsByMonth.get(i + 1) ?? 0,
      sellers: sellersByMonth.get(i + 1) ?? 0,
    }))
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Users Growth</CardTitle>
          <CardDescription>
            {period === 'hourly'
              ? 'Hourly new clients and sellers for today'
              : 'New clients and sellers per month'}
          </CardDescription>
        </div>
        <PeriodToggle period={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--color-border)' />
              <XAxis
                dataKey='label'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
                interval={period === 'hourly' ? 5 : 0}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type='monotone'
                dataKey='clients'
                stroke='var(--color-chart-1)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='sellers'
                stroke='var(--color-chart-2)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
