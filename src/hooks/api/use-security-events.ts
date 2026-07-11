import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export type SecurityEventType =
  | 'failed_login'
  | 'rate_limited'
  | 'unauthorized'

export interface SecurityEvent {
  id: number
  type: SecurityEventType
  ip_address: string
  country: string | null
  path: string
  method: string
  user_agent: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export interface SecurityEventMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface SecurityEventsResponse {
  data: SecurityEvent[]
  meta: SecurityEventMeta
}

export interface SecurityStats {
  total: number
  failed_login: number
  rate_limited: number
  unauthorized: number
  unique_ips: number
  top_ips: { ip_address: string; country: string | null; total: number }[]
}

interface Filters {
  type?: SecurityEventType | ''
  ip?: string
  from?: string
  to?: string
  page?: number
}

export function useSecurityEvents(filters: Filters = {}) {
  return useQuery({
    queryKey: ['security-events', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
      )
      const res = await api.get('/admin/security-events', { params })
      return res.data as { success: boolean } & SecurityEventsResponse
    },
    staleTime: 30_000,
  })
}

export function useSecurityStats() {
  return useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/security-events/stats')
      return res.data.data as SecurityStats
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}
