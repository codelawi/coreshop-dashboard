import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await api.get('/analytics/overview')
      return response.data
    },
  })
}

export function useAnalyticsRevenue(period: 'monthly' | 'hourly' = 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue', { params: { period } })
      return response.data
    },
  })
}

export function useAnalyticsOrders(period: 'monthly' | 'hourly' = 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'orders', period],
    queryFn: async () => {
      const response = await api.get('/analytics/orders', { params: { period } })
      return response.data
    },
  })
}

export function useAnalyticsUsers(period: 'monthly' | 'hourly' = 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'users', period],
    queryFn: async () => {
      const response = await api.get('/analytics/users', { params: { period } })
      return response.data
    },
  })
}

export function useAnalyticsTopProducts() {
  return useQuery({
    queryKey: ['analytics', 'top-products'],
    queryFn: async () => {
      const response = await api.get('/analytics/top-products')
      return response.data
    },
  })
}

export function useAnalyticsTopSellers() {
  return useQuery({
    queryKey: ['analytics', 'top-sellers'],
    queryFn: async () => {
      const response = await api.get('/analytics/top-sellers')
      return response.data
    },
  })
}

export function useAnalyticsCategories() {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => {
      const response = await api.get('/analytics/categories')
      return response.data
    },
  })
}

export function useAnalyticsEarnings(period: 'monthly' | 'hourly' = 'monthly') {
  return useQuery({
    queryKey: ['analytics', 'earnings', period],
    queryFn: async () => {
      const response = await api.get('/analytics/earnings', { params: { period } })
      return response.data
    },
  })
}

export function useAnalyticsStoreStats() {
  return useQuery({
    queryKey: ['analytics', 'store-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/store-stats')
      return response.data
    },
  })
}

export function useAnalyticsCities() {
  return useQuery({
    queryKey: ['analytics', 'cities'],
    queryFn: async () => {
      const response = await api.get('/analytics/cities')
      return response.data
    },
  })
}
