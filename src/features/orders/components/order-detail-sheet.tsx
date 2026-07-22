import { useState } from 'react'
import {
  Banknote,
  CheckCircle,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Loader2,
  MapPin,
  PackageCheck,
  PackageOpen,
  Phone,
  Printer,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Truck,
  ThumbsUp,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrder, useUpdatePaymentStatus } from '@/hooks/api/use-orders'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import type { OrderStatus } from '../data/schema'

// ─── Config ───────────────────────────────────────────────────────────────────

interface StatusCfg {
  label: string
  Icon: React.ElementType
  pill: string
  dotBg: string
  dotText: string
  dot: string
}

const STATUS_CFG: Record<OrderStatus, StatusCfg> = {
  pending: {
    label: 'Pending', Icon: Clock,
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    dotBg: 'bg-amber-100 dark:bg-amber-950', dotText: 'text-amber-500', dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved', Icon: ThumbsUp,
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    dotBg: 'bg-blue-100 dark:bg-blue-950', dotText: 'text-blue-500', dot: 'bg-blue-500',
  },
  preparing: {
    label: 'Preparing', Icon: ChefHat,
    pill: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    dotBg: 'bg-orange-100 dark:bg-orange-950', dotText: 'text-orange-500', dot: 'bg-orange-500',
  },
  ready_for_pickup: {
    label: 'Ready to Pickup', Icon: PackageCheck,
    pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    dotBg: 'bg-cyan-100 dark:bg-cyan-950', dotText: 'text-cyan-500', dot: 'bg-cyan-500',
  },
  assigned: {
    label: 'Driver Assigned', Icon: UserCheck,
    pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    dotBg: 'bg-indigo-100 dark:bg-indigo-950', dotText: 'text-indigo-500', dot: 'bg-indigo-500',
  },
  out_for_delivery: {
    label: 'Out for Delivery', Icon: Truck,
    pill: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    dotBg: 'bg-purple-100 dark:bg-purple-950', dotText: 'text-purple-500', dot: 'bg-purple-500',
  },
  delivered: {
    label: 'Delivered', Icon: PackageOpen,
    pill: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    dotBg: 'bg-green-100 dark:bg-green-950', dotText: 'text-green-600', dot: 'bg-green-500',
  },
  completed: {
    label: 'Completed', Icon: CheckCircle2,
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    dotBg: 'bg-emerald-100 dark:bg-emerald-950', dotText: 'text-emerald-600', dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled', Icon: XCircle,
    pill: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    dotBg: 'bg-red-100 dark:bg-red-950', dotText: 'text-red-500', dot: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded', Icon: RotateCcw,
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    dotBg: 'bg-rose-100 dark:bg-rose-950', dotText: 'text-rose-500', dot: 'bg-rose-500',
  },
}

const STATUS_FLOW: OrderStatus[] = [
  'pending', 'approved', 'preparing', 'ready_for_pickup',
  'assigned', 'out_for_delivery', 'delivered', 'completed',
]

const PRODUCT_GRADIENTS = [
  'from-purple-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-orange-400 to-amber-500',
  'from-red-400 to-rose-500',
  'from-indigo-400 to-violet-500',
  'from-teal-400 to-cyan-500',
  'from-fuchsia-400 to-pink-500',
]

type Tab = 'history' | 'courier' | 'receiver'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | string | null | undefined) {
  return `JOD ${Number(v ?? 0).toFixed(2)}`
}

function fmtDate(str: string) {
  if (!str) { return '—' }
  const d = new Date(str.replace(' ', 'T'))
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateTime(str: string) {
  if (!str) { return '—' }
  const d = new Date(str.replace(' ', 'T'))
  const date = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      <cfg.Icon className='h-3 w-3' />
      {cfg.label}
    </span>
  )
}

function ProductImage({ src, name, idx }: { src?: string | null; name: string; idx: number }) {
  if (src) {
    return <img src={src} alt={name} className='h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm' />
  }
  const grad = PRODUCT_GRADIENTS[idx % PRODUCT_GRADIENTS.length]
  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${grad} shadow-sm`}>
      <span className='text-base font-bold text-white'>{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  if (!value) { return null }
  return (
    <div className={className}>
      <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>{label}</p>
      <p className='mt-0.5 text-sm text-foreground'>{value}</p>
    </div>
  )
}

// ─── Order History timeline ───────────────────────────────────────────────────

function HistoryTab({ order }: { order: any }) {
  const isTerminal = order.status === 'cancelled' || order.status === 'refunded'
  const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus)

  type TItem = { status: OrderStatus; state: 'done' | 'active' | 'upcoming' }

  const items: TItem[] = STATUS_FLOW.map((s, i) => ({
    status: s,
    state: isTerminal
      ? 'upcoming'
      : i < currentIdx
        ? 'done'
        : i === currentIdx
          ? 'active'
          : 'upcoming',
  }))

  if (isTerminal) {
    items.push({ status: order.status as OrderStatus, state: 'active' })
  }

  return (
    <div>
      {items.map((item, i) => {
        const cfg = STATUS_CFG[item.status]
        const isLast = i === items.length - 1
        const isDone = item.state === 'done'
        const isActive = item.state === 'active'
        const isUpcoming = item.state === 'upcoming'

        return (
          <div key={`${item.status}-${i}`} className='flex gap-3.5'>
            {/* Track column */}
            <div className='flex shrink-0 flex-col items-center'>
              {/* Dot */}
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950'
                    : isActive
                      ? `${cfg.dotBg} ring-2 ring-offset-2 ring-offset-background ${cfg.dot} ring-opacity-30`
                      : 'bg-muted',
                ].join(' ')}
              >
                {isDone ? (
                  <CheckCircle className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                ) : (
                  <cfg.Icon
                    className={[
                      'h-4 w-4',
                      isActive ? cfg.dotText : 'text-muted-foreground/40',
                    ].join(' ')}
                  />
                )}
              </div>
              {/* Connector */}
              {!isLast && (
                <div
                  className={[
                    'my-1 w-0.5 flex-1',
                    isDone
                      ? 'bg-emerald-200 dark:bg-emerald-900'
                      : 'bg-border',
                  ].join(' ')}
                  style={{ minHeight: '20px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className={['min-w-0 flex-1', isLast ? 'pb-0' : 'pb-4'].join(' ')}>
              <div className='flex items-center justify-between gap-2 pt-1'>
                <p
                  className={[
                    'text-sm font-medium leading-none',
                    isUpcoming ? 'text-muted-foreground' : 'text-foreground',
                  ].join(' ')}
                >
                  {cfg.label}
                </p>
                {isActive && (
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${cfg.dotText}`}>
                    {order.status === 'completed' || order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'
                      ? 'Final'
                      : 'Active'}
                  </span>
                )}
              </div>
              {/* Show date only on first item (placed) and active item */}
              {item.status === 'pending' && (
                <p className='mt-0.5 text-xs text-muted-foreground'>{fmtDateTime(order.created_at)}</p>
              )}
              {isActive && item.status !== 'pending' && (
                <p className='mt-0.5 text-xs text-muted-foreground'>Status currently here</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Courier tab ──────────────────────────────────────────────────────────────

function CourierTab({ order }: { order: any }) {
  if (!order.driver && !order.store) {
    return (
      <div className='flex flex-col items-center gap-2 py-8 text-center text-muted-foreground'>
        <Truck className='h-8 w-8 opacity-20' />
        <p className='text-sm'>No driver assigned yet</p>
        <p className='text-xs'>A driver will appear here once the order is assigned.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {order.driver && (
        <div className='rounded-xl border p-4'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>Driver</p>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950'>
              <UserCheck className='h-5 w-5 text-indigo-500' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='font-semibold'>{order.driver.name}</p>
              {order.driver.phone && (
                <a
                  href={`tel:${order.driver.phone}`}
                  className='mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
                >
                  <Phone className='h-3 w-3' />
                  {order.driver.phone}
                </a>
              )}
            </div>
            {order.driver.phone && (
              <Button variant='outline' size='sm' className='h-8 gap-1.5 text-xs' asChild>
                <a href={`tel:${order.driver.phone}`}>
                  <Phone className='h-3 w-3' />
                  Call
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {order.store && (
        <div className='rounded-xl border p-4'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>Store</p>
          <div className='space-y-1.5'>
            <p className='font-semibold'>{order.store.name}</p>
            {order.store.city && (
              <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                <MapPin className='h-3.5 w-3.5' />
                {order.store.city}
              </p>
            )}
            {order.store.phone && (
              <a
                href={`tel:${order.store.phone}`}
                className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
              >
                <Phone className='h-3.5 w-3.5' />
                {order.store.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Receiver tab ─────────────────────────────────────────────────────────────

function ReceiverTab({ order }: { order: any }) {
  if (!order.address && !order.client) {
    return (
      <div className='flex flex-col items-center gap-2 py-8 text-center text-muted-foreground'>
        <MapPin className='h-8 w-8 opacity-20' />
        <p className='text-sm'>No delivery address on file</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Customer */}
      <div className='rounded-xl border p-4'>
        <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>Customer</p>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold'>
            {getInitials(order.client?.name ?? '?')}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='font-semibold'>{order.client?.name}</p>
            <p className='truncate text-xs text-muted-foreground'>{order.client?.email}</p>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.address && (
        <div className='rounded-xl border p-4'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>Delivery Address</p>
          <div className='space-y-2'>
            <InfoRow label='Recipient' value={order.address.recipient_name} />
            {order.address.phone && (
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>Phone</p>
                <a
                  href={`tel:${order.address.phone}`}
                  className='mt-0.5 flex items-center gap-1.5 text-sm hover:underline'
                >
                  <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                  {order.address.phone}
                </a>
              </div>
            )}
            <InfoRow label='Address' value={order.address.address_line} />
            {(order.address.building || order.address.floor || order.address.apartment) && (
              <InfoRow
                label='Unit'
                value={[
                  order.address.building && `Bldg ${order.address.building}`,
                  order.address.floor && `Floor ${order.address.floor}`,
                  order.address.apartment && `Apt ${order.address.apartment}`,
                ].filter(Boolean).join(', ')}
              />
            )}
            <InfoRow label='City' value={order.address.city} />
            {order.address.label && (
              <span className='mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize'>
                {order.address.label}
              </span>
            )}
            {order.address.notes && (
              <div className='mt-2 rounded-lg bg-muted/40 p-2.5'>
                <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>Notes</p>
                <p className='mt-0.5 text-xs italic text-foreground'>{order.address.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Loading / empty states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground'>
      <ShoppingBag className='h-10 w-10 opacity-20' />
      <p className='text-sm'>Order not found.</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface OrderDetailSheetProps {
  orderId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: OrderDetailSheetProps) {
  const { data, isLoading } = useOrder(open ? orderId : 0)
  const updatePaymentStatus = useUpdatePaymentStatus()

  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('history')

  const order = data?.data

  function handleCopy() {
    navigator.clipboard.writeText(String(orderId))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleApprovePayment() {
    updatePaymentStatus.mutate(
      { id: orderId, payment_status: 'paid' },
      {
        onSuccess: () => toast.success('CliQ payment approved. Client notified.'),
        onError: () => toast.error('Failed to approve payment.'),
      }
    )
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'history', label: 'Order History' },
    { id: 'courier', label: 'Courier Details' },
    { id: 'receiver', label: 'Receiver Details' },
  ]

  const totalQty = order?.items?.reduce((s: number, i: any) => s + i.quantity, 0)
    ?? order?.items_count
    ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-0 overflow-hidden p-0 sm:max-w-120'>
        <SheetTitle className='sr-only'>Order #{orderId}</SheetTitle>

        {isLoading ? (
          <LoadingState />
        ) : !order ? (
          <EmptyState />
        ) : (
          <>
            {/* ─── Header (sticky) ─── */}
            <div className='shrink-0 border-b bg-background px-5 pb-4 pt-5 pr-14'>
              {/* Row 1 */}
              <div className='flex items-start justify-between gap-3'>
                <div className='space-y-1.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Order:</span>
                    <button
                      onClick={handleCopy}
                      className='group flex items-center gap-1.5'
                    >
                      <span className='font-mono text-base font-bold tracking-tight text-foreground'>
                        #{order.id}
                      </span>
                      {copied ? (
                        <CheckCircle className='h-3.5 w-3.5 text-emerald-500' />
                      ) : (
                        <Copy className='h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                      )}
                    </button>
                  </div>
                  <StatusBadge status={order.status as OrderStatus} />
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1.5 text-xs'
                  onClick={() => window.print()}
                >
                  <Printer className='h-3.5 w-3.5' />
                  Print Details
                </Button>
              </div>

              {/* Row 2: dates */}
              <div className='mt-3 space-y-0.5 text-xs text-muted-foreground'>
                <p>
                  Order Date:{' '}
                  <span className='font-medium text-foreground'>{fmtDate(order.created_at)}</span>
                </p>
              </div>
            </div>

            {/* ─── Scrollable body ─── */}
            <div className='flex-1 overflow-y-auto'>

              {/* Items section */}
              <div className='px-5 pt-5'>
                {/* Items header */}
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <ShoppingBag className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-semibold'>Ordered items</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>Total quantity: {totalQty}</span>
                </div>

                {/* Items card */}
                <div className='overflow-hidden rounded-xl border'>
                  {!collapsed && order.items?.length > 0 && (
                    <div className='divide-y'>
                      {order.items.map((item: any, i: number) => (
                        <div key={item.id} className='flex items-center gap-3 px-3.5 py-3.5'>
                          <ProductImage src={item.product_image} name={item.product_name} idx={i} />
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium leading-tight'>{item.product_name}</p>
                            {item.variant_label && (
                              <p className='mt-0.5 text-xs text-muted-foreground'>{item.variant_label}</p>
                            )}
                            {item.weight_grams && (
                              <p className='mt-0.5 text-xs text-muted-foreground'>{item.weight_grams} g</p>
                            )}
                          </div>
                          <div className='shrink-0 text-right'>
                            <p className='text-sm font-semibold'>{fmt(item.total)}</p>
                            <p className='mt-0.5 text-xs text-muted-foreground'>Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Collapse toggle */}
                  {order.items?.length > 0 && (
                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      className='flex w-full items-center justify-center gap-1.5 border-t px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground'
                    >
                      {collapsed ? (
                        <>
                          <ChevronDown className='h-3.5 w-3.5' />
                          Show all {order.items.length} items
                        </>
                      ) : (
                        <>
                          <ChevronUp className='h-3.5 w-3.5' />
                          Collapse all
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Payment strip */}
              <div className='mx-5 mt-3 flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3'>
                {order.payment_method === 'cliq' ? (
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950'>
                    <Smartphone className='h-4 w-4 text-blue-500' />
                  </div>
                ) : (
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950'>
                    <Banknote className='h-4 w-4 text-green-600' />
                  </div>
                )}

                <div className='min-w-0 flex-1'>
                  {order.payment_method === 'cliq' ? (
                    <>
                      <p className='text-sm font-medium'>
                        Paid via <span className='font-semibold'>CliQ</span>
                        {order.cliq_reference && (
                          <span className='ml-1 font-mono text-xs text-muted-foreground'>
                            · {order.cliq_reference}
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className='text-sm font-medium'>Cash on Delivery</p>
                  )}
                  <p className={`text-xs font-medium ${order.payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {order.payment_status === 'paid' ? 'Payment confirmed' : 'Awaiting payment'}
                  </p>
                </div>

                <div className='shrink-0 text-right'>
                  <p className='text-[10px] text-muted-foreground'>Total</p>
                  <p className='text-sm font-bold'>{fmt(order.total)}</p>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className='mx-5 mt-1.5 space-y-1 rounded-lg bg-muted/20 px-4 py-3 text-xs'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className='flex justify-between font-medium text-emerald-600 dark:text-emerald-400'>
                    <span>Discount{order.coupon ? ` · ${order.coupon.code}` : ''}</span>
                    <span>−{fmt(order.discount)}</span>
                  </div>
                )}
                <div className='flex justify-between text-muted-foreground'>
                  <span>Delivery fee</span>
                  <span>{fmt(order.delivery_fee ?? 0)}</span>
                </div>
                {Number(order.platform_fee) > 0 && (
                  <div className='flex justify-between text-muted-foreground'>
                    <span>Platform fee</span>
                    <span>{fmt(order.platform_fee)}</span>
                  </div>
                )}
                <Separator className='my-1.5' />
                <div className='flex justify-between font-semibold text-foreground'>
                  <span>Total</span>
                  <span>{fmt(order.total)}</span>
                </div>
              </div>

              {/* Customer notes */}
              {order.notes && (
                <div className='mx-5 mt-2 rounded-xl border border-dashed bg-muted/10 px-4 py-3'>
                  <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                    Customer Notes
                  </p>
                  <p className='text-sm italic text-foreground'>{order.notes}</p>
                </div>
              )}

              {/* CliQ approval banner */}
              {order.payment_method === 'cliq' && order.payment_status === 'unpaid' && (
                <div className='mx-5 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/60'>
                  <p className='mb-0.5 text-sm font-semibold text-amber-800 dark:text-amber-300'>
                    CliQ Payment Pending
                  </p>
                  <p className='mb-3 text-xs text-amber-700 dark:text-amber-400'>
                    Verify the CliQ transfer from this customer in your bank, then approve.
                  </p>
                  {order.cliq_reference && (
                    <p className='mb-3 text-xs text-amber-700 dark:text-amber-400'>
                      Reference:{' '}
                      <span className='font-mono font-semibold'>{order.cliq_reference}</span>
                    </p>
                  )}
                  <Button
                    size='sm'
                    className='gap-2 bg-emerald-600 text-white hover:bg-emerald-700'
                    onClick={handleApprovePayment}
                    disabled={updatePaymentStatus.isPending}
                  >
                    {updatePaymentStatus.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <CheckCircle className='h-4 w-4' />
                    )}
                    Approve Payment
                  </Button>
                </div>
              )}

              {/* ─── Tabs ─── */}
              <div className='mt-5 border-t'>
                {/* Tab bar */}
                <div className='flex overflow-x-auto px-2'>
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        'shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors',
                        activeTab === tab.id
                          ? 'border-foreground text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                      ].join(' ')}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className='px-5 pb-10 pt-5'>
                  {activeTab === 'history' && <HistoryTab order={order} />}
                  {activeTab === 'courier' && <CourierTab order={order} />}
                  {activeTab === 'receiver' && <ReceiverTab order={order} />}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
