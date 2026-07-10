import { useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck, Package, ShoppingBag, UserPlus } from 'lucide-react'
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

function typeIcon(type: DashboardNotification['type']) {
  if (type === 'new_order') { return <ShoppingBag className='h-4 w-4 text-blue-500' /> }
  if (type === 'new_product') { return <Package className='h-4 w-4 text-purple-500' /> }
  return <UserPlus className='h-4 w-4 text-green-500' />
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) { return 'just now' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}m ago` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}h ago` }
  return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationBell() {
  const queryClient = useQueryClient()
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
      toast(payload.title, {
        description: payload.body,
        icon: typeIcon(payload.type),
      })
    },
    [queryClient]
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground'>
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
        <ScrollArea className='h-[360px]'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground'>
              <Bell className='h-8 w-8 opacity-20' />
              <p className='text-xs'>No notifications yet</p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${n.read_at ? 'opacity-60' : ''}`}
                >
                  <div className='mt-0.5 shrink-0'>{typeIcon(n.type)}</div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium leading-snug'>{n.title}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground leading-snug'>{n.body}</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read_at && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className='mt-1 shrink-0 text-muted-foreground hover:text-foreground'
                      title='Mark as read'
                    >
                      <Check className='h-3.5 w-3.5' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
