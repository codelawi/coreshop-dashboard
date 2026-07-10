import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

interface SendGroupNotification {
  type: 'group'
  title: string
  body: string
  roles: string[]
}

interface SendUsersNotification {
  type: 'users'
  title: string
  body: string
  user_ids: number[]
}

type SendNotificationPayload = SendGroupNotification | SendUsersNotification

export function useSendNotification() {
  return useMutation({
    mutationFn: async (payload: SendNotificationPayload) => {
      const response = await api.post('/admin/notifications/send', payload)
      return response.data
    },
  })
}
