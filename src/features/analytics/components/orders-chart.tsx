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

interface MonthlyPoint {
  month: number
  total: number
}

export function OrdersChart() {
  const { data, isLoading } = useAnalyticsOrders()
  const monthly: MonthlyPoint[] = data?.data?.monthly ?? []
  const byMonth = new Map<number, number>()
  monthly.forEach((p) => byMonth.set(Number(p.month), Number(p.total)))

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    orders: byMonth.get(i + 1) ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Over Time</CardTitle>
        <CardDescription>
          Monthly order count for the current year
        </CardDescription>
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
              <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={tooltipStyle} />
              <Bar dataKey='orders' fill='var(--color-chart-1)' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
