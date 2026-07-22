import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface DashboardNotification {
  id: number
  type: 'new_order' | 'new_product' | 'new_user' | 'new_support_message' | 'new_feedback'
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

interface NotificationsPage {
  data: DashboardNotification[]
  has_more: boolean
  unread_count: number
}

export interface NotificationSettings {
  notif_new_orders: boolean
  notif_new_products: boolean
  notif_new_users: boolean
}

export function useDashboardNotifications() {
  return useInfiniteQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await api.get('/admin/dashboard-notifications', {
        params: { page: pageParam, per_page: 20 },
      })
      return res.data as NotificationsPage
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.has_more ? lastPageParam + 1 : undefined,
    staleTime: 30_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/admin/dashboard-notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (type?: string) => {
      await api.post('/admin/dashboard-notifications/read-all', type ? { type } : undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] })
    },
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard-notifications/settings')
      return res.data.data as NotificationSettings
    },
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      await api.patch('/admin/dashboard-notifications/settings', settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
    },
  })
}
