import { useEffect, useRef } from 'react'
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

const ERROR_LEVELS: LogLevel[] = ['emergency', 'alert', 'critical', 'error']

export function useLogErrorNotifications() {
  const latestTimestamp = useRef<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }, [])

  const { data } = useQuery({
    queryKey: ['log-error-alert'],
    queryFn: async () => {
      const res = await api.get('/admin/logs', { params: { limit: 50 } })
      return res.data as { data: LogEntry[]; meta: LogMeta }
    },
    staleTime: 0,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    if (!data) { return }

    const errors = data.data.filter((e) => ERROR_LEVELS.includes(e.level))
    if (errors.length === 0) { return }

    const newest = errors[0].timestamp

    if (!initialized.current) {
      latestTimestamp.current = newest
      initialized.current = true
      return
    }

    if (latestTimestamp.current && newest > latestTimestamp.current) {
      latestTimestamp.current = newest

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Server Error', {
          body: errors[0].message.slice(0, 120),
          icon: '/favicon.ico',
          tag: 'server-log-error',
        })
      }
    }
  }, [data])
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
