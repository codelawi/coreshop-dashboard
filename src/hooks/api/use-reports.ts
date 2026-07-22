import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface Report {
  id: number
  type: 'bug' | 'problem'
  description: string
  steps: string | null
  status: 'new' | 'in_progress' | 'resolved'
  created_at: string
  user: {
    id: number
    name: string
    email: string
    avatar: string | null
  } | null
}

interface ReportsResponse {
  data: Report[]
  meta: { total: number; current_page: number; last_page: number }
}

interface ReportsParams {
  type?: string
  status?: string
  per_page?: number
}

export function useReports(params: ReportsParams = {}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const res = await api.get('/admin/feedback', { params })
      return res.data as ReportsResponse
    },
  })
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/admin/feedback/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
