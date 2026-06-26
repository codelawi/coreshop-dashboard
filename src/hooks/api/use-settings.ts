import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/payment')
      return response.data
    },
  })
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      platform_fee_percentage: number
      delivery_fee_per_km: number
      delivery_fee_minimum: number
    }) => {
      const response = await api.patch('/settings/payment', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] })
    },
  })
}
