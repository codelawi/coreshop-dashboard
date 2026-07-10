import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface DashboardNotification {
  id: number
  type: 'new_order' | 'new_product' | 'new_user'
  title: string
  body: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export interface NotificationSettings {
  notif_new_orders: boolean
  notif_new_products: boolean
  notif_new_users: boolean
}

export function useDashboardNotifications() {
  return useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard-notifications')
      return res.data as { data: DashboardNotification[]; unread_count: number }
    },
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
    mutationFn: async () => {
      await api.post('/admin/dashboard-notifications/read-all')
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
