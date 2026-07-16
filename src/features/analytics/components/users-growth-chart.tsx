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

interface UserPoint {
  month: number
  role: string
  total: number
}

export function UsersGrowthChart() {
  const { data, isLoading } = useAnalyticsUsers()
  const points: UserPoint[] = data?.data ?? []

  const clientsByMonth = new Map<number, number>()
  const sellersByMonth = new Map<number, number>()

  points.forEach((p) => {
    const month = Number(p.month)
    const total = Number(p.total)
    if (p.role === 'client') { clientsByMonth.set(month, total) }
    if (p.role === 'seller') { sellersByMonth.set(month, total) }
  })

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    clients: clientsByMonth.get(i + 1) ?? 0,
    sellers: sellersByMonth.get(i + 1) ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Growth</CardTitle>
        <CardDescription>New clients and sellers per month</CardDescription>
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
