import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/hooks/api/use-dashboard-notifications'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

const schema = z.object({
  notif_new_orders: z.boolean(),
  notif_new_products: z.boolean(),
  notif_new_users: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function NotificationsForm() {
  const { data: settings, isLoading } = useNotificationSettings()
  const update = useUpdateNotificationSettings()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      notif_new_orders: true,
      notif_new_products: true,
      notif_new_users: true,
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  async function onSubmit(data: FormValues) {
    try {
      await update.mutateAsync(data)
      toast.success('Notification settings saved.')
    } catch {
      toast.error('Failed to save settings.')
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Choose which platform events trigger a real-time notification in your
          admin dashboard.
        </p>

        <FormField
          control={form.control}
          name='notif_new_orders'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>New Orders</FormLabel>
                <FormDescription>
                  Get notified when a customer places a new order.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='notif_new_products'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>New Products</FormLabel>
                <FormDescription>
                  Get notified when a seller submits a new product for review.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='notif_new_users'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>New Users</FormLabel>
                <FormDescription>
                  Get notified when a new user registers on the platform.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={update.isPending}>
          {update.isPending && (
            <Loader2 className='me-2 h-4 w-4 animate-spin' />
          )}
          Save Settings
        </Button>
      </form>
    </Form>
  )
}
