import { useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.email('Please enter a valid email.'),
})

type ProfileValues = z.infer<typeof profileSchema>

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  async function onSubmit(data: ProfileValues) {
    setIsSubmitting(true)
    try {
      await api.patch('/auth/profile', data)
      await fetchMe()
      toast.success('Profile updated.')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url: string = res.data.data.url
      await api.patch('/auth/profile', { avatar: url })
      await fetchMe()
      toast.success('Avatar updated.')
    } catch {
      toast.error('Failed to upload avatar.')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className='space-y-6'>
      {/* Avatar */}
      <div className='flex items-center gap-4'>
        <div className='relative'>
          <Avatar className='h-16 w-16 rounded-xl'>
            <AvatarImage src={(user as any)?.avatar ?? undefined} alt={user?.name} />
            <AvatarFallback className='rounded-xl text-lg'>
              {getInitials(user?.name ?? 'A')}
            </AvatarFallback>
          </Avatar>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50'
          >
            {avatarUploading ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              <Camera className='h-3 w-3' />
            )}
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className='text-sm font-medium'>{user?.name}</p>
          <p className='text-xs text-muted-foreground'>{user?.role}</p>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className='mt-1 text-xs text-primary hover:underline disabled:opacity-50'
          >
            {avatarUploading ? 'Uploading…' : 'Change photo'}
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder='Your name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' placeholder='you@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  )
}
