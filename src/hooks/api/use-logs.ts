import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export type LogLevel =
  | 'emergency'
  | 'alert'
  | 'critical'
  | 'error'
  | 'warning'
  | 'notice'
  | 'info'
  | 'debug'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: Record<string, unknown> | null
}

export interface LogMeta {
  total: number
  file_size_kb: number
  date: string
  available_dates: string[]
  levels: LogLevel[]
}

interface LogFilters {
  level?: LogLevel | ''
  limit?: number
  search?: string
  date?: string
}

export function useLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
      )
      const res = await api.get('/admin/logs', { params })
      return res.data as { success: boolean; data: LogEntry[]; meta: LogMeta }
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useClearLogs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (date?: string) => {
      await api.delete('/admin/logs', { params: date ? { date } : undefined })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })
}
