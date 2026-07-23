import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAnalyticsEarnings } from '@/hooks/api/use-analytics'
import { PeriodToggle } from './period-toggle'

const MONTHS = [
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

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`)

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

interface EarningsPoint {
  month?: number
  hour?: number
  revenue: number
  earnings: number
}

export function PlatformEarningsChart() {
  const [period, setPeriod] = useState<'monthly' | 'hourly'>('monthly')
  const { data, isLoading } = useAnalyticsEarnings(period)
  const points: EarningsPoint[] = data?.data ?? []

  let chartData: { label: string; GMV: number; Earnings: number }[]

  if (period === 'hourly') {
    const hourMap = new Map(points.map((p) => [p.hour, p]))
    chartData = HOURS.map((h, i) => {
      const p = hourMap.get(i)
      return { label: h, GMV: p?.revenue ?? 0, Earnings: p?.earnings ?? 0 }
    })
  } else {
    const monthMap = new Map(points.map((p) => [p.month, p]))
    chartData = MONTHS.map((m, i) => {
      const p = monthMap.get(i + 1)
      return { label: m, GMV: p?.revenue ?? 0, Earnings: p?.earnings ?? 0 }
    })
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Platform Earnings vs GMV</CardTitle>
          <CardDescription>
            {period === 'hourly'
              ? 'Hourly gross merchandise value vs platform fee income for today'
              : 'Monthly gross merchandise value vs platform fee income'}
          </CardDescription>
        </div>
        <PeriodToggle period={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='gmv-grad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='earn-grad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='var(--color-border)'
              />
              <XAxis
                dataKey='label'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
                interval={period === 'hourly' ? 5 : 0}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
                tickFormatter={compact}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v) => [
                  `JOD ${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type='monotone'
                dataKey='GMV'
                stroke='#3b82f6'
                strokeWidth={2}
                fill='url(#gmv-grad)'
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type='monotone'
                dataKey='Earnings'
                stroke='#10b981'
                strokeWidth={2}
                fill='url(#earn-grad)'
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
