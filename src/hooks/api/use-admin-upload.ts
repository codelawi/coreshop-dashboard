import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useAdminUpload() {
  return useMutation({
    mutationFn: async ({ file, folder = 'banners' }: { file: File; folder?: 'banners' | 'categories' | 'avatars' }) => {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data as { success: boolean; data: { url: string } }
    },
  })
}
