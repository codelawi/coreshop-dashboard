import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required.'),
    password: z.string().min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

export function AccountForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(data: PasswordValues) {
    setIsSubmitting(true)
    try {
      await api.patch('/auth/change-password', data)
      toast.success('Password changed successfully.')
      form.reset()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Failed to change password.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='current_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Enter current password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Enter new password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password_confirmation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Confirm new password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
          Change Password
        </Button>
      </form>
    </Form>
  )
}
