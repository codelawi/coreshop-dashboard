import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CheckCheck, Flag, MessageSquare, Package, ShoppingBag, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import echo from '@/lib/echo'
import {
  type DashboardNotification,
  useDashboardNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/api/use-dashboard-notifications'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const NOTIFICATION_ROUTE: Record<DashboardNotification['type'], string> = {
  new_order: '/orders',
  new_product: '/products',
  new_user: '/users',
  new_support_message: '/chat',
  new_feedback: '/reports',
}

function typeIcon(type: DashboardNotification['type']) {
  if (type === 'new_order') { return <ShoppingBag className='h-4 w-4 text-blue-500' /> }
  if (type === 'new_product') { return <Package className='h-4 w-4 text-purple-500' /> }
  if (type === 'new_support_message') { return <MessageSquare className='h-4 w-4 text-orange-500' /> }
  if (type === 'new_feedback') { return <Flag className='h-4 w-4 text-red-500' /> }
  return <UserPlus className='h-4 w-4 text-green-500' />
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) { return 'just now' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}m ago` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}h ago` }
  return `${Math.floor(diff / 86400)}d ago`
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.4)
  } catch {
    // Audio not supported
  }
}

export function NotificationBell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data } = useDashboardNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const unreadCount = data?.unread_count ?? 0
  const notifications = data?.data ?? []

  const handleIncoming = useCallback(
    (payload: DashboardNotification) => {
      queryClient.setQueryData(
        ['dashboard-notifications'],
        (old: { data: DashboardNotification[]; unread_count: number } | undefined) => ({
          data: [payload, ...(old?.data ?? [])].slice(0, 50),
          unread_count: (old?.unread_count ?? 0) + 1,
        })
      )
      playNotificationSound()
      toast(payload.title, {
        description: payload.body,
        icon: typeIcon(payload.type),
        action: {
          label: 'View',
          onClick: () => navigate({ to: NOTIFICATION_ROUTE[payload.type] as never }),
        },
      })
    },
    [queryClient, navigate]
  )

  useEffect(() => {
    const channel = echo.private('admin-notifications').listen(
      '.AdminNotificationCreated',
      handleIncoming
    )
    return () => {
      channel.stopListening('.AdminNotificationCreated')
    }
  }, [handleIncoming])

  function handleNotificationClick(n: DashboardNotification) {
    if (!n.read_at) { markRead.mutate(n.id) }
    setOpen(false)
    navigate({ to: NOTIFICATION_ROUTE[n.type] as never })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between px-4 py-3'>
          <span className='text-sm font-semibold'>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto gap-1 px-2 py-1 text-xs'
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className='h-3 w-3' />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className='h-90'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <Bell className='h-8 w-8 opacity-20' />
              <p className='text-xs'>No notifications yet</p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${n.read_at ? 'opacity-60' : 'bg-muted/20'}`}
                >
                  <div className='mt-0.5 shrink-0'>{typeIcon(n.type)}</div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium leading-snug'>{n.title}</p>
                    <p className='mt-0.5 text-xs leading-snug text-muted-foreground'>{n.body}</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read_at && (
                    <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500' />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
