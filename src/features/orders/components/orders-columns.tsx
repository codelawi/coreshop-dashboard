import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Banknote, Check, Copy, Eye, MoreHorizontal, Smartphone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import type { Order, OrderStatus } from '../data/schema'
import { OrderDetailSheet } from './order-detail-sheet'
import { StatusChangeDialog } from './status-change-dialog'
import { UserProfileSheet } from '@/features/users/components/user-profile-sheet'

// ─── Status pill ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
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

function StatusPill({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    className: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

// ─── Payment pill ─────────────────────────────────────────────────────────────

function PaymentPill({ method }: { method: string | null }) {
  if (!method) { return <span className='text-sm text-muted-foreground'>—</span> }
  if (method === 'cliq') {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400'>
        <Smartphone className='h-3 w-3' />
        CliQ
      </span>
    )
  }
  if (method === 'cash_on_delivery') {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400'>
        <Banknote className='h-3 w-3' />
        Cash
      </span>
    )
  }
  return (
    <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize'>
      {method.replace(/_/g, ' ')}
    </span>
  )
}

// ─── User cell with avatar ────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function UserCell({
  id,
  name,
  email,
  avatar,
}: {
  id: number
  name: string
  email: string
  avatar?: string | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className='flex items-center gap-2 text-left hover:opacity-80'>
        <Avatar className='h-7 w-7 shrink-0'>
          {avatar && <AvatarImage src={avatar} />}
          <AvatarFallback className='text-[10px]'>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium leading-none'>{name}</p>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>{email}</p>
        </div>
      </button>
      <UserProfileSheet userId={id} open={open} onOpenChange={setOpen} />
    </>
  )
}

// ─── Copy Order ID cell ───────────────────────────────────────────────────────

function OrderIdCell({ id }: { id: number }) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(String(id))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='group flex items-center gap-1'>
      <span className='font-mono text-sm font-medium'>#{id}</span>
      <button
        onClick={handleCopy}
        className='invisible rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:visible group-hover:opacity-100'
      >
        {copied ? (
          <Check className='h-3.5 w-3.5 text-green-500' />
        ) : (
          <Copy className='h-3.5 w-3.5' />
        )}
      </button>
    </div>
  )
}

// ─── Row actions ─────────────────────────────────────────────────────────────

function OrderRowActions({ order }: { order: Order }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

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

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setStatusOpen(true)}
              >
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>Change status</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Change Status</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <OrderDetailSheet
        orderId={order.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <StatusChangeDialog
        order={order}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => <OrderIdCell id={row.getValue('id')} />,
  },
  {
    accessorKey: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const client = row.getValue('client') as Order['client']
      return (
        <UserCell
          id={client.id}
          name={client.name}
          email={client.email}
          avatar={client.avatar}
        />
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <StatusPill status={row.getValue('status') as OrderStatus} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'store',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store' />
    ),
    cell: ({ row }) => {
      const store = row.original.store
      if (!store) { return <span className='text-sm text-muted-foreground'>—</span> }
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
      if (!seller) { return <span className='text-sm text-muted-foreground'>—</span> }
      return (
        <UserCell
          id={seller.id}
          name={seller.name}
          email={seller.email}
          avatar={seller.avatar}
        />
      )
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
      <PaymentPill method={row.getValue('payment_method') as string | null} />
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
