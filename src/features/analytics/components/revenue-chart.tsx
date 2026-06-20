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
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id='revenueGradient'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='hsl(var(--primary))'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='hsl(var(--primary))'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis
                dataKey='month'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='hsl(var(--muted-foreground))'
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='hsl(var(--muted-foreground))'
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='hsl(var(--primary))'
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
