import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import echo from '@/lib/echo'

export interface SupportUser {
  id: number
  name: string
  avatar: string | null
  role: string
}

export interface SupportLastMessage {
  id: number
  body: string
  sender_id: number
  created_at: string
}

export interface SupportConversation {
  id: number
  user: SupportUser
  last_message: SupportLastMessage | null
  last_message_at: string | null
  created_at: string
}

export interface SupportMessage {
  id: number
  support_conversation_id: number
  sender_id: number
  sender_name: string
  sender_avatar: string | null
  sender_role: string
  body: string
  read_at: string | null
  created_at: string
}

export function useSupportConversations() {
  return useQuery({
    queryKey: ['support-conversations'],
    queryFn: async () => {
      const res = await api.get('/admin/support')
      return res.data.data as SupportConversation[]
    },
  })
}

export function useOrStartSupportConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.get(`/admin/support/users/${userId}`)
      return res.data.data as SupportConversation
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support-conversations'] }),
  })
}

export function useSupportMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ['support-messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/admin/support/${conversationId}/messages`)
      return res.data.data as SupportMessage[]
    },
    enabled: !!conversationId,
  })
}

export function useSendSupportMessage(conversationId: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: string) => {
      const res = await api.post(`/admin/support/${conversationId}/messages`, { body })
      return res.data.data as SupportMessage
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-messages', conversationId] })
      qc.invalidateQueries({ queryKey: ['support-conversations'] })
    },
  })
}

export function useSupportChannel(conversationId: number | null) {
  const qc = useQueryClient()
  const channelRef = useRef<ReturnType<typeof echo.private> | null>(null)

  useEffect(() => {
    if (!conversationId) return

    const channel = echo.private(`support.${conversationId}`)
    channelRef.current = channel

    channel.listen('.SupportMessageSent', (data: SupportMessage) => {
      qc.setQueryData<SupportMessage[]>(
        ['support-messages', conversationId],
        (prev = []) => {
          if (prev.some((m) => m.id === data.id)) return prev
          return [...prev, data]
        },
      )
      qc.invalidateQueries({ queryKey: ['support-conversations'] })
    })

    return () => {
      channel.stopListening('.SupportMessageSent')
      echo.leave(`support.${conversationId}`)
      channelRef.current = null
    }
  }, [conversationId, qc])
}
