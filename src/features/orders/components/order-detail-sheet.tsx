import { Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useOrder, useUpdateOrderStatus } from '@/hooks/api/use-orders'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { OrderStatus } from '../data/schema'

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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  ready_for_pickup: 'bg-purple-100 text-purple-700',
  assigned: 'bg-sky-100 text-sky-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

function formatCurrency(v: number | string) {
  return `JOD ${Number(v ?? 0).toFixed(2)}`
}

interface OrderDetailSheetProps {
  orderId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const { data, isLoading } = useOrder(open ? orderId : 0)
  const updateStatus = useUpdateOrderStatus()
  const order = data?.data

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(
      { id: orderId, status },
      {
        onSuccess: () => toast.success(`Order status updated to ${statusLabel[status as OrderStatus]}.`),
        onError: () => toast.error('Failed to update order status.'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Order #{orderId}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : !order ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <ShoppingBag className='h-8 w-8 opacity-30' />
            <p className='text-sm'>Order not found.</p>
          </div>
        ) : (
          <div className='mt-4 space-y-6 px-4 pb-6'>
            {/* Status + Change */}
            <div className='flex items-center justify-between gap-4'>
              <Badge
                variant='secondary'
                className={`capitalize ${STATUS_COLORS[order.status] ?? ''}`}
              >
                {statusLabel[order.status as OrderStatus] ?? order.status}
              </Badge>
              <Select
                value={order.status}
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger className='w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div>
                <p className='mb-3 font-medium'>
                  Items ({order.items.length})
                </p>
                <div className='space-y-3'>
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className='flex items-start gap-3 rounded-lg border p-3'
                    >
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className='h-14 w-14 flex-shrink-0 rounded-md object-cover'
                        />
                      ) : (
                        <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-muted'>
                          <ShoppingBag className='h-5 w-5 text-muted-foreground' />
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='font-medium'>{item.product_name}</p>
                        {item.variant_label && (
                          <p className='text-xs text-muted-foreground'>
                            {item.variant_label}
                          </p>
                        )}
                        {item.weight_grams && (
                          <p className='text-xs text-muted-foreground'>
                            Weight: {item.weight_grams} g
                          </p>
                        )}
                      </div>
                      <div className='text-right text-sm'>
                        <p className='font-medium'>{formatCurrency(item.total)}</p>
                        <p className='text-xs text-muted-foreground'>
                          {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Financials */}
            <div className='space-y-1.5 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className='flex justify-between text-green-600'>
                  <span>Discount</span>
                  <span>−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Delivery Fee</span>
                <span>{formatCurrency(order.delivery_fee ?? 0)}</span>
              </div>
              <Separator />
              <div className='flex justify-between font-semibold'>
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <Separator />

            {/* People & Store */}
            <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
              <div>
                <p className='mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide'>Customer</p>
                <p className='font-medium'>{order.client?.name}</p>
                <p className='text-muted-foreground'>{order.client?.email}</p>
              </div>

              {order.store && (
                <div>
                  <p className='mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide'>Store</p>
                  <p className='font-medium'>{order.store.name}</p>
                  {order.store.city && (
                    <p className='text-muted-foreground'>{order.store.city}</p>
                  )}
                  {order.store.phone && (
                    <p className='text-muted-foreground'>{order.store.phone}</p>
                  )}
                </div>
              )}

              {order.driver && (
                <div>
                  <p className='mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide'>Driver</p>
                  <p className='font-medium'>{order.driver.name}</p>
                  {order.driver.phone && (
                    <p className='text-muted-foreground'>{order.driver.phone}</p>
                  )}
                </div>
              )}

              {order.address && (
                <div>
                  <p className='mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide'>Delivery Address</p>
                  <p className='font-medium'>{order.address.recipient_name}</p>
                  <p className='text-muted-foreground'>{order.address.address_line}</p>
                  {order.address.building && (
                    <p className='text-muted-foreground'>
                      {[order.address.building && `Bldg ${order.address.building}`, order.address.floor && `Floor ${order.address.floor}`, order.address.apartment && `Apt ${order.address.apartment}`].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className='text-muted-foreground'>{order.address.city}</p>
                  {order.address.phone && (
                    <p className='text-muted-foreground'>{order.address.phone}</p>
                  )}
                  {order.address.notes && (
                    <p className='mt-1 text-xs italic text-muted-foreground'>
                      {order.address.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment & Notes */}
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-xs text-muted-foreground'>Payment Method</p>
                <p className='font-medium capitalize'>
                  {order.payment_method?.replace(/_/g, ' ') ?? '—'}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Payment Status</p>
                <p className='font-medium capitalize'>{order.payment_status}</p>
              </div>
              {order.coupon && (
                <div>
                  <p className='text-xs text-muted-foreground'>Coupon</p>
                  <p className='font-mono font-medium'>{order.coupon.code}</p>
                </div>
              )}
              {order.notes && (
                <div className='col-span-2'>
                  <p className='text-xs text-muted-foreground'>Customer Notes</p>
                  <p className='mt-0.5 italic'>{order.notes}</p>
                </div>
              )}
            </div>

            {updateStatus.isPending && (
              <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Updating status…
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
