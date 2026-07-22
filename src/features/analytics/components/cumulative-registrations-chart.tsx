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
import { useAnalyticsUsers } from '@/hooks/api/use-analytics'

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

interface UserPoint {
  month: number
  role: string
  total: number
}

export function CumulativeRegistrationsChart() {
  const { data, isLoading } = useAnalyticsUsers()
  const points: UserPoint[] = data?.data ?? []

  const clientsByMonth = new Map<number, number>()
  const sellersByMonth = new Map<number, number>()
  points.forEach((p) => {
    const m = Number(p.month)
    const t = Number(p.total)
    if (p.role === 'client') {
      clientsByMonth.set(m, t)
    }
    if (p.role === 'seller') {
      sellersByMonth.set(m, t)
    }
  })

  let cumClients = 0
  let cumSellers = 0
  const chartData = MONTHS.map((m, i) => {
    cumClients += clientsByMonth.get(i + 1) ?? 0
    cumSellers += sellersByMonth.get(i + 1) ?? 0
    return { month: m, Clients: cumClients, Sellers: cumSellers }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative User Growth</CardTitle>
        <CardDescription>
          Total platform members accumulated over the year
        </CardDescription>
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
                <linearGradient
                  id='clients-grad'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id='sellers-grad'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='var(--color-border)'
              />
              <XAxis
                dataKey='month'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke='var(--color-muted-foreground)'
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type='monotone'
                dataKey='Clients'
                stroke='#6366f1'
                strokeWidth={2}
                fill='url(#clients-grad)'
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type='monotone'
                dataKey='Sellers'
                stroke='#f59e0b'
                strokeWidth={2}
                fill='url(#sellers-grad)'
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
