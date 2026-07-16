import { Loader2 } from 'lucide-react'
import { useOrders } from '@/hooks/api/use-orders'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const statusVariant: Record<string, BadgeVariant> = {
  delivered: 'default',
  processing: 'secondary',
  pending: 'outline',
  cancelled: 'destructive',
  shipped: 'secondary',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatCurrency(value: number | string) {
  return `JOD ${Number(value).toFixed(2)}`
}

export function RecentSales() {
  const { data, isLoading } = useOrders({ per_page: 5 })

  if (isLoading) {
    return (
      <div className='flex h-[200px] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const orders: Order[] = data?.data ?? []

  if (orders.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>No recent orders yet.</p>
    )
  }

  return (
    <div className='space-y-6'>
      {orders.slice(0, 5).map((order) => (
        <div key={order.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={order.client.avatar ?? undefined} />
            <AvatarFallback>{getInitials(order.client.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {order.client.name}
              </p>
              <p className='text-xs text-muted-foreground'>
                {order.client.email}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={statusVariant[order.status] ?? 'outline'}>
                {order.status}
              </Badge>
              <span className='text-sm font-medium'>
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
