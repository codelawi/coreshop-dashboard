import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateCoupon } from '@/hooks/api/use-coupons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Coupon, CouponType } from '../data/schema'
import { useCoupons } from './coupons-provider'

const typeLabel: Record<CouponType, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
}

function CouponActions({ coupon }: { coupon: Coupon }) {
  const { setOpen, setCurrentRow } = useCoupons()
  const updateCoupon = useUpdateCoupon()

  const handleToggle = () => {
    updateCoupon.mutate(
      { id: coupon.id, active: !coupon.active },
      {
        onSuccess: () => {
          toast.success(
            `Coupon ${coupon.code} ${
              !coupon.active ? 'activated' : 'deactivated'
            }.`
          )
        },
        onError: () => {
          toast.error('Failed to update coupon.')
        },
      }
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          disabled={updateCoupon.isPending}
        >
          {updateCoupon.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <DotsHorizontalIcon className='h-4 w-4' />
          )}
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(coupon)
            setOpen('edit')
          }}
        >
          Edit
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle}>
          {coupon.active ? 'Deactivate' : 'Activate'}
          <DropdownMenuShortcut>
            {coupon.active ? (
              <ToggleLeft size={16} className='text-yellow-600' />
            ) : (
              <ToggleRight size={16} className='text-green-600' />
            )}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(coupon)
            setOpen('delete')
          }}
          className='text-red-500!'
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const couponsColumns: ColumnDef<Coupon>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => (
      <span className='font-mono font-medium'>{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as CouponType
      return <Badge variant='outline'>{typeLabel[type]}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discount' />
    ),
    cell: ({ row }) => {
      const type = row.original.type
      const value = Number(row.getValue('value'))
      return (
        <span className='font-medium'>
          {type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'min_order_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Min. Order' />
    ),
    cell: ({ row }) => (
      <span>${Number(row.getValue('min_order_amount')).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: 'used_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usage' />
    ),
    cell: ({ row }) => {
      const used = row.getValue('used_count') as number
      const limit = row.original.usage_limit
      return (
        <span className='text-sm'>
          {used} / {limit}
        </span>
      )
    },
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean
      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: 'expires_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expires' />
    ),
    cell: ({ row }) => {
      const v = row.getValue('expires_at') as string | null
      return (
        <span className='text-sm text-muted-foreground'>
          {v ?? 'No expiry'}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CouponActions coupon={row.original} />,
  },
]
