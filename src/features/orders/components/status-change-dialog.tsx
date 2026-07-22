import { useState } from 'react'
import {
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  Clock,
  Loader2,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  Smartphone,
  Truck,
  ThumbsUp,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateOrderStatus } from '@/hooks/api/use-orders'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Order, OrderStatus } from '../data/schema'

// ─── Status configuration ─────────────────────────────────────────────────────

interface StatusConfig {
  label: string
  description: string
  action: string
  Icon: React.ElementType
  iconClass: string
  iconBg: string
  cardBase: string
  cardHover: string
  cardSelected: string
  pill: string
  selectedRing: string
  confirmBg: string
  confirmBorder: string
}

const STATUS_OPTIONS: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    description: 'Order is awaiting review and approval',
    action: 'Customer receives a notification that their order is under review.',
    Icon: Clock,
    iconClass: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-amber-400',
    cardHover: 'hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/50 shadow-sm',
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    selectedRing: 'ring-amber-400',
    confirmBg: 'bg-amber-50 dark:bg-amber-950/50',
    confirmBorder: 'border-l-amber-400',
  },
  approved: {
    label: 'Approved',
    description: 'Order is verified and accepted by the platform',
    action: 'Seller is notified immediately to start preparing the order.',
    Icon: ThumbsUp,
    iconClass: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-blue-400',
    cardHover: 'hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-sm',
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    selectedRing: 'ring-blue-400',
    confirmBg: 'bg-blue-50 dark:bg-blue-950/50',
    confirmBorder: 'border-l-blue-400',
  },
  preparing: {
    label: 'Preparing',
    description: 'Seller is actively preparing the order',
    action: 'Customer is updated that their order is being carefully prepared.',
    Icon: ChefHat,
    iconClass: 'text-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-orange-400',
    cardHover: 'hover:bg-orange-50/60 dark:hover:bg-orange-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-950/50 shadow-sm',
    pill: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    selectedRing: 'ring-orange-400',
    confirmBg: 'bg-orange-50 dark:bg-orange-950/50',
    confirmBorder: 'border-l-orange-400',
  },
  ready_for_pickup: {
    label: 'Ready to Pickup',
    description: 'Order is packed and awaiting driver collection',
    action: 'Nearby available drivers receive a pickup request for this order.',
    Icon: PackageCheck,
    iconClass: 'text-cyan-500',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-cyan-400',
    cardHover: 'hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 shadow-sm',
    pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    selectedRing: 'ring-cyan-400',
    confirmBg: 'bg-cyan-50 dark:bg-cyan-950/50',
    confirmBorder: 'border-l-cyan-400',
  },
  assigned: {
    label: 'Driver Assigned',
    description: 'A driver has accepted and will collect this order',
    action: 'Customer receives driver details and an estimated delivery time.',
    Icon: UserCheck,
    iconClass: 'text-indigo-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-indigo-400',
    cardHover: 'hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm',
    pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    selectedRing: 'ring-indigo-400',
    confirmBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    confirmBorder: 'border-l-indigo-400',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    description: 'Order is en route to the customer\'s address',
    action: 'Customer receives live updates and a delivery ETA.',
    Icon: Truck,
    iconClass: 'text-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-purple-400',
    cardHover: 'hover:bg-purple-50/60 dark:hover:bg-purple-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-950/50 shadow-sm',
    pill: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    selectedRing: 'ring-purple-400',
    confirmBg: 'bg-purple-50 dark:bg-purple-950/50',
    confirmBorder: 'border-l-purple-400',
  },
  delivered: {
    label: 'Delivered',
    description: 'Order has been handed to the customer',
    action: 'Customer is prompted to confirm receipt and leave a review.',
    Icon: PackageOpen,
    iconClass: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-green-400',
    cardHover: 'hover:bg-green-50/60 dark:hover:bg-green-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-green-400 bg-green-50 dark:bg-green-950/50 shadow-sm',
    pill: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    selectedRing: 'ring-green-400',
    confirmBg: 'bg-green-50 dark:bg-green-950/50',
    confirmBorder: 'border-l-green-400',
  },
  completed: {
    label: 'Completed',
    description: 'Order is fully fulfilled and permanently closed',
    action: 'Payment is finalized and seller receives their earnings payout.',
    Icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-emerald-400',
    cardHover: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shadow-sm',
    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    selectedRing: 'ring-emerald-400',
    confirmBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    confirmBorder: 'border-l-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled before fulfilment',
    action: 'Customer is notified and a refund is initiated if payment was collected.',
    Icon: XCircle,
    iconClass: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-red-400',
    cardHover: 'hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-red-400 bg-red-50 dark:bg-red-950/50 shadow-sm',
    pill: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    selectedRing: 'ring-red-400',
    confirmBg: 'bg-red-50 dark:bg-red-950/50',
    confirmBorder: 'border-l-red-400',
  },
  refunded: {
    label: 'Refunded',
    description: 'Payment has been returned to the customer',
    action: 'Refund confirmation is sent and financial records are updated.',
    Icon: RotateCcw,
    iconClass: 'text-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/60',
    cardBase: 'border border-border border-l-[3px] border-l-rose-400',
    cardHover: 'hover:bg-rose-50/60 dark:hover:bg-rose-950/30 hover:shadow-sm',
    cardSelected: 'ring-2 ring-rose-400 bg-rose-50 dark:bg-rose-950/50 shadow-sm',
    pill: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    selectedRing: 'ring-rose-400',
    confirmBg: 'bg-rose-50 dark:bg-rose-950/50',
    confirmBorder: 'border-l-rose-400',
  },
}

const ALL_STATUSES = Object.keys(STATUS_OPTIONS) as OrderStatus[]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function StatusPill({ status }: { status: OrderStatus }) {
  const cfg = STATUS_OPTIONS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      <cfg.Icon className='h-3 w-3' />
      {cfg.label}
    </span>
  )
}

function PaymentChip({ method }: { method: string | null }) {
  if (!method) { return null }
  if (method === 'cliq') {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400'>
        <Smartphone className='h-3 w-3' />
        CliQ
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400'>
      <Banknote className='h-3 w-3' />
      Cash
    </span>
  )
}

// ─── Phase 1 — status grid ────────────────────────────────────────────────────

interface SelectPhaseProps {
  order: Order
  selected: OrderStatus | null
  onSelect: (s: OrderStatus) => void
  onContinue: () => void
  onClose: () => void
}

function SelectPhase({ order, selected, onSelect, onContinue, onClose }: SelectPhaseProps) {
  return (
    <div className='flex flex-col'>
      {/* Order summary card */}
      <div className='mx-6 flex items-center gap-3 rounded-2xl border bg-muted/30 p-4'>
        <Avatar className='h-11 w-11 shrink-0 ring-2 ring-border'>
          {order.client.avatar && <AvatarImage src={order.client.avatar} />}
          <AvatarFallback className='text-sm font-semibold'>
            {getInitials(order.client.name)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold leading-none'>{order.client.name}</p>
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>{order.client.email}</p>
          <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
            <span className='font-mono text-xs font-bold text-muted-foreground'>#{order.id}</span>
            <span className='text-xs text-muted-foreground'>·</span>
            <span className='text-xs font-medium'>JOD {Number(order.total).toFixed(2)}</span>
            <span className='text-xs text-muted-foreground'>·</span>
            <span className='text-xs text-muted-foreground'>{order.items_count} items</span>
            <PaymentChip method={order.payment_method} />
          </div>
        </div>
        <div className='shrink-0'>
          <StatusPill status={order.status} />
          <p className='mt-1 text-center text-[10px] text-muted-foreground'>Current</p>
        </div>
      </div>

      {/* Section label */}
      <div className='mx-6 mt-5 mb-3'>
        <p className='text-sm font-semibold text-foreground'>Select a new status</p>
        <p className='text-xs text-muted-foreground'>Click a status card to see what will happen</p>
      </div>

      {/* Status grid */}
      <div className='mx-6 grid grid-cols-2 gap-2'>
        {ALL_STATUSES.map((status) => {
          const cfg = STATUS_OPTIONS[status]
          const isCurrent = status === order.status
          const isSelected = status === selected

          return (
            <button
              key={status}
              onClick={() => { if (!isCurrent) { onSelect(status) } }}
              disabled={isCurrent}
              className={[
                'relative flex items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-150',
                cfg.cardBase,
                isCurrent
                  ? 'cursor-not-allowed opacity-40 bg-muted/20'
                  : isSelected
                    ? cfg.cardSelected
                    : `bg-card ${cfg.cardHover} cursor-pointer`,
              ].join(' ')}
            >
              {/* Icon badge */}
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                <cfg.Icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${cfg.iconClass}`} />
              </div>

              {/* Text */}
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold leading-tight'>{cfg.label}</p>
                <p className='mt-0.5 text-[11px] leading-snug text-muted-foreground'>
                  {cfg.description}
                </p>
                <p className={`mt-1.5 text-[11px] font-medium leading-snug ${cfg.iconClass}`}>
                  → {cfg.action.split('. ')[0]}
                </p>
              </div>

              {/* State indicator */}
              {isCurrent && (
                <span className='absolute right-2.5 top-2.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  Now
                </span>
              )}
              {isSelected && !isCurrent && (
                <span className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full ${cfg.iconBg}`}>
                  <Check className={`h-3 w-3 ${cfg.iconClass}`} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className='mx-6 mt-5 flex items-center justify-between border-t pt-4'>
        <Button variant='ghost' onClick={onClose} className='text-muted-foreground'>
          Cancel
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selected}
          className='gap-2 px-5'
        >
          Review Change
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

// ─── Phase 2 — confirmation ───────────────────────────────────────────────────

interface ConfirmPhaseProps {
  order: Order
  from: OrderStatus
  to: OrderStatus
  isPending: boolean
  onConfirm: () => void
  onBack: () => void
}

function ConfirmPhase({ order, from, to, isPending, onConfirm, onBack }: ConfirmPhaseProps) {
  const fromCfg = STATUS_OPTIONS[from]
  const toCfg = STATUS_OPTIONS[to]

  const isDestructive = to === 'cancelled' || to === 'refunded'
  const isPositive = to === 'completed' || to === 'delivered'

  return (
    <div className='flex flex-col items-center px-8 pb-2 pt-2'>
      {/* Large icon */}
      <div
        className={`mb-5 flex h-24 w-24 items-center justify-center rounded-3xl ${toCfg.iconBg} shadow-lg ring-4 ring-border`}
      >
        <toCfg.Icon className={`h-12 w-12 ${toCfg.iconClass}`} />
      </div>

      <h3 className='text-xl font-bold tracking-tight'>Confirm Status Change</h3>
      <p className='mt-1.5 text-sm text-muted-foreground'>
        You are updating order{' '}
        <span className='font-mono font-bold text-foreground'>#{order.id}</span>
      </p>

      {/* From → To */}
      <div className='mt-6 flex w-full items-center justify-center gap-4'>
        <div className='flex flex-col items-center gap-1.5'>
          <StatusPill status={from} />
          <span className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            Current
          </span>
        </div>

        <div className='flex items-center gap-1 text-muted-foreground'>
          <div className='h-px w-8 bg-border' />
          <ArrowRight className='h-4 w-4' />
          <div className='h-px w-8 bg-border' />
        </div>

        <div className='flex flex-col items-center gap-1.5'>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ring-2 ${toCfg.pill} ${toCfg.selectedRing}`}
          >
            <toCfg.Icon className='h-3.5 w-3.5' />
            {toCfg.label}
          </span>
          <span className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
            New Status
          </span>
        </div>
      </div>

      {/* Impact box */}
      <div
        className={`mt-6 w-full rounded-2xl border-l-[4px] p-4 ${toCfg.confirmBg} ${toCfg.confirmBorder}`}
      >
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          What happens next
        </p>
        <p className={`text-sm font-medium leading-relaxed ${toCfg.iconClass}`}>
          {toCfg.action}
        </p>
      </div>

      {/* Order strip */}
      <div className='mt-4 flex w-full items-center gap-3 rounded-2xl border bg-muted/30 px-4 py-3'>
        <Avatar className='h-8 w-8 shrink-0'>
          {order.client.avatar && <AvatarImage src={order.client.avatar} />}
          <AvatarFallback className='text-xs'>{getInitials(order.client.name)}</AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold'>{order.client.name}</p>
          <p className='truncate text-xs text-muted-foreground'>{order.client.email}</p>
        </div>
        <div className='shrink-0 text-right'>
          <p className='font-mono text-xs font-bold text-muted-foreground'>#{order.id}</p>
          <p className='text-sm font-bold'>JOD {Number(order.total).toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className='mt-6 flex w-full gap-3'>
        <Button
          variant='outline'
          className='flex-1 gap-2'
          onClick={onBack}
          disabled={isPending}
        >
          <ChevronLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          className={[
            'flex-1 gap-2 font-semibold',
            isDestructive
              ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
              : isPositive
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                : '',
          ].join(' ')}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <CheckCircle2 className='h-4 w-4' />
          )}
          {isPending ? 'Updating…' : 'Confirm Change'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface StatusChangeDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StatusChangeDialog({ order, open, onOpenChange }: StatusChangeDialogProps) {
  const [selected, setSelected] = useState<OrderStatus | null>(null)
  const [phase, setPhase] = useState<'select' | 'confirm'>('select')
  const updateStatus = useUpdateOrderStatus()

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => {
      setSelected(null)
      setPhase('select')
    }, 200)
  }

  function handleConfirm() {
    if (!selected) { return }
    updateStatus.mutate(
      { id: order.id, status: selected },
      {
        onSuccess: () => {
          toast.success(
            `Order #${order.id} updated to "${STATUS_OPTIONS[selected].label}".`
          )
          handleClose()
        },
        onError: () => {
          toast.error('Failed to update order status. Please try again.')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl gap-0 overflow-hidden p-0'>
        <DialogHeader className='border-b px-6 py-4'>
          <div className='flex items-center gap-3'>
            {phase === 'confirm' && (
              <button
                onClick={() => setPhase('select')}
                disabled={updateStatus.isPending}
                className='rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
              >
                <ChevronLeft className='h-5 w-5' />
              </button>
            )}
            <div>
              <DialogTitle className='text-base font-semibold'>
                {phase === 'select' ? 'Change Order Status' : 'Confirm Status Change'}
              </DialogTitle>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {phase === 'select'
                  ? 'Choose the new status for this order'
                  : 'Review the change before applying it'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className='max-h-[82vh] overflow-y-auto py-5'>
          {phase === 'select' ? (
            <SelectPhase
              order={order}
              selected={selected}
              onSelect={setSelected}
              onContinue={() => setPhase('confirm')}
              onClose={handleClose}
            />
          ) : (
            <ConfirmPhase
              order={order}
              from={order.status}
              to={selected!}
              isPending={updateStatus.isPending}
              onConfirm={handleConfirm}
              onBack={() => setPhase('select')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
