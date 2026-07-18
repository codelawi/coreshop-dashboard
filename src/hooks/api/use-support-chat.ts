import { useEffect, useRef } from 'react'
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
  unread_count: number
  created_at: string
}

export interface SupportMessage {
  id: number
  support_conversation_id: number
  sender_id: number
  sender_name: string
  sender_avatar: string | null
  sender_role: string
  type: 'text' | 'image'
  body: string
  read_at: string | null
  created_at: string
}

type SupportMessagesPage = { data: SupportMessage[]; meta: { has_more: boolean } }

export function useSupportConversations() {
  return useQuery({
    queryKey: ['support-conversations'],
    queryFn: async () => {
      const res = await api.get('/admin/support')
      return res.data.data as SupportConversation[]
    },
    refetchInterval: 5000,
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
  return useInfiniteQuery({
    queryKey: ['support-messages', conversationId],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const params: Record<string, unknown> = { limit: 10 }
      if (pageParam) { params.before_id = pageParam }
      const res = await api.get(`/admin/support/${conversationId}/messages`, { params })
      return res.data as SupportMessagesPage
    },
    initialPageParam: undefined as number | undefined,
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.meta.has_more || firstPage.data.length === 0) { return undefined }
      return firstPage.data[0].id
    },
    enabled: !!conversationId,
  })
}

export function useSendSupportMessage(conversationId: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { body?: string; imageFile?: File }) => {
      let data: FormData | { body: string }

      if (payload.imageFile) {
        const form = new FormData()
        form.append('image', payload.imageFile)
        data = form
      } else {
        data = { body: payload.body ?? '' }
      }

      const res = await api.post(`/admin/support/${conversationId}/messages`, data)
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
      qc.setQueryData<InfiniteData<SupportMessagesPage>>(
        ['support-messages', conversationId],
        (prev) => {
          if (!prev) { return prev }
          const lastIdx = prev.pages.length - 1
          const lastPage = prev.pages[lastIdx]
          if (lastPage.data.some((m) => m.id === data.id)) { return prev }
          return {
            ...prev,
            pages: prev.pages.map((page, i) =>
              i === lastIdx ? { ...page, data: [...page.data, data] } : page
            ),
          }
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
