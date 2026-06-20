import type { ColumnDef } from '@tanstack/react-table'
import { CheckCircle, Flag, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateProductStatus } from '@/hooks/api/use-products'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import type { Product, ProductStatus } from '../data/schema'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const statusVariant: Record<ProductStatus, BadgeVariant> = {
  approved: 'default',
  pending_review: 'secondary',
  flagged: 'outline',
  removed: 'destructive',
}

const statusLabel: Record<ProductStatus, string> = {
  approved: 'Approved',
  pending_review: 'Pending Review',
  flagged: 'Flagged',
  removed: 'Removed',
}

function ProductRowActions({ product }: { product: Product }) {
  const updateStatus = useUpdateProductStatus()

  const handle = (status: ProductStatus, label: string) => {
    updateStatus.mutate(
      { id: product.id, status },
      {
        onSuccess: () => {
          toast.success(`Product "${product.name}" ${label}.`)
        },
        onError: () => {
          toast.error('Failed to update product status.')
        },
      }
    )
  }

  if (updateStatus.isPending) {
    return (
      <div className='flex h-8 w-8 items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </div>
    )
  }

  const status = product.status

  return (
    <TooltipProvider delayDuration={100}>
      <div className='flex items-center gap-1'>
        {status === 'pending_review' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700'
                onClick={() => handle('approved', 'approved')}
              >
                <CheckCircle className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Approve</TooltipContent>
          </Tooltip>
        )}
        {status !== 'flagged' && status !== 'removed' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700'
                onClick={() => handle('flagged', 'flagged')}
              >
                <Flag className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flag</TooltipContent>
          </Tooltip>
        )}
        {status !== 'removed' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                onClick={() => handle('removed', 'removed')}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-sm font-medium'>
        #{row.getValue('id')}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px]'>
        <p className='truncate text-sm font-medium'>{row.getValue('name')}</p>
        <p className='text-xs text-muted-foreground'>
          {row.original.category.name}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'seller',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Seller' />
    ),
    cell: ({ row }) => {
      const seller = row.getValue('seller') as Product['seller']
      return (
        <div>
          <p className='text-sm font-medium'>{seller.name}</p>
          <p className='text-xs text-muted-foreground'>{seller.email}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = Number(row.getValue('price'))
      return <span className='font-medium'>${price.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      return (
        <span
          className={stock === 0 ? 'font-medium text-destructive' : 'text-sm'}
        >
          {stock === 0 ? 'Out of stock' : stock}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as ProductStatus
      return (
        <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {row.getValue('created_at')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <span className='text-sm font-medium'>Actions</span>,
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
]
