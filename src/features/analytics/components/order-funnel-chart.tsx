import { Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAnalyticsOrders } from '@/hooks/api/use-analytics'

const PIPELINE = [
  'pending',
  'approved',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'out_for_delivery',
  'delivered',
  'completed',
]
const DROP_OFF = ['cancelled', 'refunded']

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  approved: '#3b82f6',
  preparing: '#f97316',
  ready_for_pickup: '#06b6d4',
  assigned: '#6366f1',
  out_for_delivery: '#a855f7',
  delivered: '#22c55e',
  completed: '#10b981',
  cancelled: '#ef4444',
  refunded: '#f43f5e',
}

function formatStatus(s: string) {
  const map: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    preparing: 'Preparing',
    ready_for_pickup: 'Ready for Pickup',
    assigned: 'Assigned',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return (
    map[s] ??
    s
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

interface StatusPoint {
  status: string
  total: number
}

export function OrderFunnelChart() {
  const { data, isLoading } = useAnalyticsOrders()
  const byStatus: StatusPoint[] = data?.data?.by_status ?? []

  const statusMap = new Map(byStatus.map((s) => [s.status, Number(s.total)]))
  const total = byStatus.reduce((s, p) => s + Number(p.total), 0)

  const pipeline = PIPELINE.map((s) => ({
    status: s,
    count: statusMap.get(s) ?? 0,
  })).filter((s) => s.count > 0)
  const dropoffs = DROP_OFF.map((s) => ({
    status: s,
    count: statusMap.get(s) ?? 0,
  })).filter((s) => s.count > 0)
  const maxCount = Math.max(...pipeline.map((s) => s.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Completion Funnel</CardTitle>
        <CardDescription>How orders flow through each stage</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : pipeline.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No order data yet.</p>
          </div>
        ) : (
          <div className='space-y-2 pt-2'>
            {pipeline.map((stage) => {
              const pct = (stage.count / maxCount) * 100
              const ofTotal =
                total > 0
                  ? ((stage.count / total) * 100).toFixed(1)
                  : '0'
              const color = STATUS_COLORS[stage.status] ?? '#94a3b8'
              return (
                <div key={stage.status} className='flex items-center gap-3'>
                  <span className='w-[130px] shrink-0 text-right text-xs font-medium text-muted-foreground'>
                    {formatStatus(stage.status)}
                  </span>
                  <div className='relative flex h-7 flex-1 overflow-hidden rounded-lg bg-muted/50'>
                    <div
                      className='h-full rounded-lg transition-all duration-700'
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}ee, ${color}88)`,
                      }}
                    />
                    <span
                      className='absolute inset-0 flex items-center justify-end pr-2.5 text-[11px] font-semibold'
                      style={{ color }}
                    >
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                  <span className='w-10 text-right text-xs text-muted-foreground'>
                    {ofTotal}%
                  </span>
                </div>
              )
            })}
            {dropoffs.length > 0 && (
              <>
                <div className='my-2 flex items-center gap-2'>
                  <div className='h-px flex-1 bg-border' />
                  <span className='text-[11px] text-muted-foreground'>
                    Drop-offs
                  </span>
                  <div className='h-px flex-1 bg-border' />
                </div>
                {dropoffs.map((stage) => {
                  const pct = (stage.count / maxCount) * 100
                  const ofTotal =
                    total > 0
                      ? ((stage.count / total) * 100).toFixed(1)
                      : '0'
                  const color = STATUS_COLORS[stage.status] ?? '#94a3b8'
                  return (
                    <div
                      key={stage.status}
                      className='flex items-center gap-3 opacity-70'
                    >
                      <span className='w-[130px] shrink-0 text-right text-xs font-medium text-muted-foreground'>
                        {formatStatus(stage.status)}
                      </span>
                      <div className='relative flex h-7 flex-1 overflow-hidden rounded-lg bg-muted/50'>
                        <div
                          className='h-full rounded-lg'
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}ee, ${color}66)`,
                          }}
                        />
                        <span
                          className='absolute inset-0 flex items-center justify-end pr-2.5 text-[11px] font-semibold'
                          style={{ color }}
                        >
                          {stage.count.toLocaleString()}
                        </span>
                      </div>
                      <span className='w-10 text-right text-xs text-muted-foreground'>
                        {ofTotal}%
                      </span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
