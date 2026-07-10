import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await api.get('/users', { params })
      return response.data
    },
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`)
      return response.data
    },
    enabled: id > 0,
  })
}

export function useAdminChangeUserPassword() {
  return useMutation({
    mutationFn: async ({ id, password, password_confirmation }: { id: number; password: string; password_confirmation: string }) => {
      const response = await api.patch(`/users/${id}/password`, { password, password_confirmation })
      return response.data
    },
  })
}

export function useAdminToggleEmailVerify() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/users/${id}/email-verify`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.patch(`/users/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: { name?: string; email?: string; role?: string; phone?: string | null; city?: string | null; avatar?: string | null }
    }) => {
      const response = await api.patch(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
