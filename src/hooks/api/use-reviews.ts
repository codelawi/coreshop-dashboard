import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useAdminReviews(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const response = await api.get('/admin/reviews', { params })
      return response.data
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/reviews/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
