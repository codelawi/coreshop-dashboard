import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, Loader2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateOrderStatus } from '@/hooks/api/use-orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import type { Order, OrderStatus } from '../data/schema'
import { OrderDetailSheet } from './order-detail-sheet'
import { UserProfileSheet } from '@/features/users/components/user-profile-sheet'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'outline',
  approved: 'secondary',
  preparing: 'secondary',
  ready_for_pickup: 'secondary',
  assigned: 'secondary',
  out_for_delivery: 'default',
  delivered: 'default',
  completed: 'default',
  cancelled: 'destructive',
  refunded: 'destructive',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  assigned: 'Driver Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const allStatuses: OrderStatus[] = [
  'pending',
  'approved',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
]

function UserCell({ id, name, email }: { id: number; name: string; email: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className='text-left hover:underline'>
        <p className='text-sm font-medium'>{name}</p>
        <p className='text-xs text-muted-foreground'>{email}</p>
      </button>
      <UserProfileSheet userId={id} open={open} onOpenChange={setOpen} />
    </>
  )
}

function OrderRowActions({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const [detailOpen, setDetailOpen] = useState(false)

  const handleChange = (status: OrderStatus) => {
    if (status === order.status) return
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () => {
          toast.success(`Order #${order.id} marked as ${statusLabel[status]}.`)
        },
        onError: () => {
          toast.error('Failed to update order status.')
        },
      }
    )
  }

  return (
    <>
      <div className='flex items-center gap-1'>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setDetailOpen(true)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Manage Order</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <MoreHorizontal className='h-4 w-4' />
              )}
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Change status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allStatuses.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === order.status}
                onClick={() => handleChange(status)}
              >
                {statusLabel[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <OrderDetailSheet
        orderId={order.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm font-medium'>
        #{row.getValue('id')}
      </span>
    ),
  },
  {
    accessorKey: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const client = row.getValue('client') as Order['client']
      return <UserCell id={client.id} name={client.name} email={client.email} />
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderStatus
      return (
        <Badge variant={statusVariant[status]}>
          {statusLabel[status] ?? status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'store',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store' />
    ),
    cell: ({ row }) => {
      const store = row.original.store
      if (!store) return <span className='text-sm text-muted-foreground'>—</span>
      return (
        <Link
          to='/stores/$storeId'
          params={{ storeId: String(store.id) }}
          className='text-sm font-medium hover:underline'
        >
          {store.name}
        </Link>
      )
    },
  },
  {
    id: 'seller',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Seller' />
    ),
    cell: ({ row }) => {
      const seller = row.original.seller
      if (!seller) return <span className='text-sm text-muted-foreground'>—</span>
      return <UserCell id={seller.id} name={seller.name} email={seller.email} />
    },
  },
  {
    accessorKey: 'items_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{row.getValue('items_count')} items</span>
    ),
  },
  {
    accessorKey: 'payment_method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment' />
    ),
    cell: ({ row }) => (
      <span className='text-sm capitalize'>
        {(row.getValue('payment_method') as string)?.replace(/_/g, ' ') ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const total = Number(row.getValue('total'))
      return <span className='font-medium'>JOD {total.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const val = row.getValue('created_at') as string
      const [date, time] = val.split(' ')
      return (
        <div className='text-sm'>
          <p>{date}</p>
          {time && <p className='text-xs text-muted-foreground'>{time}</p>}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrderRowActions order={row.original} />,
  },
]
