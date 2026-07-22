import { Loader2 } from 'lucide-react'
import { useOrders } from '@/hooks/api/use-orders'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Order {
  id: number
  client: {
    id: number
    name: string
    email: string
    avatar?: string | null
  }
  status: string
  total: string | number
  created_at: string
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:          { label: 'Pending',          className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  approved:         { label: 'Approved',         className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  preparing:        { label: 'Preparing',        className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
  ready_for_pickup: { label: 'Ready to Pickup',  className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' },
  assigned:         { label: 'Assigned',         className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  delivered:        { label: 'Delivered',        className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
  completed:        { label: 'Completed',        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  cancelled:        { label: 'Cancelled',        className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
  refunded:         { label: 'Refunded',         className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_STYLES[status] ?? {
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    className: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatCurrency(value: number | string) {
  return `JOD ${Number(value).toFixed(2)}`
}

export function RecentSales() {
  const { data, isLoading } = useOrders({ per_page: 5 })

  if (isLoading) {
    return (
      <div className='flex h-52 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const orders: Order[] = data?.data ?? []

  if (orders.length === 0) {
    return <p className='text-sm text-muted-foreground'>No recent orders yet.</p>
  }

  return (
    <div className='space-y-4'>
      {orders.slice(0, 5).map((order) => (
        <div key={order.id} className='flex items-center gap-3'>
          <Avatar className='h-9 w-9 shrink-0'>
            <AvatarImage src={order.client.avatar ?? undefined} />
            <AvatarFallback className='text-xs'>{getInitials(order.client.name)}</AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium leading-none'>{order.client.name}</p>
            <p className='mt-0.5 truncate text-xs text-muted-foreground'>{order.client.email}</p>
          </div>
          <div className='flex shrink-0 flex-col items-end gap-1'>
            <span className='text-sm font-semibold'>{formatCurrency(order.total)}</span>
            <StatusPill status={order.status} />
          </div>
        </div>
      ))}
    </div>
  )
}
