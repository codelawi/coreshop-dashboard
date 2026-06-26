import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useAdminStores(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['admin-stores', params],
    queryFn: async () => {
      const response = await api.get('/stores', { params })
      return response.data
    },
  })
}

export function useAdminStore(id: number) {
  return useQuery({
    queryKey: ['admin-store', id],
    queryFn: async () => {
      const response = await api.get(`/stores/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useAdminStoreOrders(id: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['admin-store-orders', id, params],
    queryFn: async () => {
      const response = await api.get(`/stores/${id}/orders`, { params })
      return response.data
    },
    enabled: !!id,
  })
}

export function useAdminStoreProducts(id: number, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['admin-store-products', id, params],
    queryFn: async () => {
      const response = await api.get(`/stores/${id}/products`, { params })
      return response.data
    },
    enabled: !!id,
  })
}

export function useAdminCreateStoreProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      storeId,
      ...data
    }: { storeId: number } & Record<string, unknown>) => {
      const response = await api.post(`/stores/${storeId}/products`, data)
      return response.data
    },
    onSuccess: (_data, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-store-products', storeId] })
    },
  })
}

export function useAdminCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await api.post('/stores', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    },
  })
}

export function useUpdateStoreStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.patch(`/stores/${id}/status`, { status })
      return response.data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
