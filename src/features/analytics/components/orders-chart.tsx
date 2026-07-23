import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalyticsOrders } from '@/hooks/api/use-analytics'
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

interface TimeSeriesPoint {
  month?: number
  hour?: number
  total: number
}

export function OrdersChart() {
  const [period, setPeriod] = useState<'monthly' | 'hourly'>('monthly')
  const { data, isLoading } = useAnalyticsOrders(period)
  const timeSeries: TimeSeriesPoint[] = data?.data?.time_series ?? []

  let chartData: { label: string; orders: number }[]

  if (period === 'hourly') {
    const byHour = new Map<number, number>()
    timeSeries.forEach((p) => byHour.set(Number(p.hour), Number(p.total)))
    chartData = HOURS.map((h, i) => ({
      label: h,
      orders: byHour.get(i) ?? 0,
    }))
  } else {
    const byMonth = new Map<number, number>()
    timeSeries.forEach((p) => byMonth.set(Number(p.month), Number(p.total)))
    chartData = MONTHS.map((m, i) => ({
      label: m,
      orders: byMonth.get(i + 1) ?? 0,
    }))
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Orders Over Time</CardTitle>
          <CardDescription>
            {period === 'hourly'
              ? 'Hourly order count for today'
              : 'Monthly order count for the current year'}
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
            <BarChart data={chartData}>
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
              <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={tooltipStyle} />
              <Bar dataKey='orders' fill='var(--color-chart-1)' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
