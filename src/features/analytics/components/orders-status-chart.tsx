import { Loader2 } from 'lucide-react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useAnalyticsOrders } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const STATUS_COLORS: Record<string, string> = {
  pending:           '#eab308',
  approved:          '#3b82f6',
  preparing:         '#f97316',
  ready_for_pickup:  '#06b6d4',
  assigned:          '#6366f1',
  out_for_delivery:  '#a855f7',
  delivered:         '#22c55e',
  completed:         '#10b981',
  cancelled:         '#ef4444',
  refunded:          '#f43f5e',
}

const STATUS_LABELS: Record<string, string> = {
  pending:           'Pending',
  approved:          'Approved',
  preparing:         'Preparing',
  ready_for_pickup:  'Ready for Pickup',
  assigned:          'Assigned',
  out_for_delivery:  'Out for Delivery',
  delivered:         'Delivered',
  completed:         'Completed',
  cancelled:         'Cancelled',
  refunded:          'Refunded',
}

function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface StatusPoint {
  status: string
  total: number
}

export function OrdersStatusChart() {
  const { data, isLoading } = useAnalyticsOrders()
  const byStatus: StatusPoint[] = data?.data?.by_status ?? []

  const chartData = byStatus.map((p) => ({
    name: formatStatus(p.status),
    value: Number(p.total),
    status: p.status,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>Distribution of all platform orders</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-75 items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No orders yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey='value'
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [v, n]}
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
