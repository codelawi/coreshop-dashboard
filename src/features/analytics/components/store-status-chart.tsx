import { Loader2 } from 'lucide-react'
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAnalyticsStoreStats } from '@/hooks/api/use-analytics'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#22c55e' },
  pending: { label: 'Pending', color: '#eab308' },
  suspended: { label: 'Suspended', color: '#ef4444' },
  closed: { label: 'Closed', color: '#94a3b8' },
}

interface StoreStatItem {
  status: string
  count: number
}

export function StoreStatusChart() {
  const { data, isLoading } = useAnalyticsStoreStats()
  const items: StoreStatItem[] = data?.data ?? []

  const total = items.reduce((s, i) => s + i.count, 0)

  const chartData = items.map((item) => ({
    name: STATUS_CONFIG[item.status]?.label ?? item.status,
    count: item.count,
    fill: STATUS_CONFIG[item.status]?.color ?? '#94a3b8',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Status Distribution</CardTitle>
        <CardDescription>
          Breakdown of all registered stores by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No stores yet.</p>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <ResponsiveContainer width={260} height={260}>
                <RadialBarChart
                  cx='50%'
                  cy='50%'
                  innerRadius={45}
                  outerRadius={120}
                  startAngle={90}
                  endAngle={-270}
                  data={chartData}
                  barSize={16}
                >
                  <RadialBar
                    dataKey='count'
                    cornerRadius={8}
                    background={{ fill: 'var(--color-muted)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-popover-foreground)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(v, n) => [v, n]}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-2xl font-bold'>{total}</span>
                <span className='text-xs text-muted-foreground'>
                  total stores
                </span>
              </div>
            </div>
            <div className='flex flex-wrap justify-center gap-x-4 gap-y-2'>
              {chartData.map((d) => (
                <div key={d.name} className='flex items-center gap-1.5'>
                  <span
                    className='h-2.5 w-2.5 rounded-full'
                    style={{ background: d.fill }}
                  />
                  <span className='text-xs text-muted-foreground'>{d.name}</span>
                  <span className='text-xs font-semibold'>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
