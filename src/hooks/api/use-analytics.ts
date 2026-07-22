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

export function useAnalyticsRevenue() {
  return useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue')
      return response.data
    },
  })
}

export function useAnalyticsOrders() {
  return useQuery({
    queryKey: ['analytics', 'orders'],
    queryFn: async () => {
      const response = await api.get('/analytics/orders')
      return response.data
    },
  })
}

export function useAnalyticsUsers() {
  return useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: async () => {
      const response = await api.get('/analytics/users')
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

export function useAnalyticsEarnings() {
  return useQuery({
    queryKey: ['analytics', 'earnings'],
    queryFn: async () => {
      const response = await api.get('/analytics/earnings')
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
