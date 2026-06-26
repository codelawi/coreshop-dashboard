import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface PaymentSettings {
  platform_fee_percentage: number
  delivery_fee_per_km: number
  delivery_fee_minimum: number
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/payment')
      return response.data.data as PaymentSettings
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: PaymentSettings) => {
      const response = await api.patch('/settings/payment', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] })
    },
  })
}
