import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign, Truck, Loader2 } from 'lucide-react'
import { usePaymentSettings, useUpdatePaymentSettings } from '@/hooks/api/use-settings'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const schema = z.object({
  platform_fee_percentage: z
    .number({ invalid_type_error: 'Required' })
    .min(0)
    .max(100),
  delivery_fee_per_km: z
    .number({ invalid_type_error: 'Required' })
    .min(0),
  delivery_fee_minimum: z
    .number({ invalid_type_error: 'Required' })
    .min(0),
})

type FormValues = z.infer<typeof schema>

export function PaymentSettings() {
  const { data, isLoading } = usePaymentSettings()
  const update = useUpdatePaymentSettings()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform_fee_percentage: 10,
      delivery_fee_per_km: 0.3,
      delivery_fee_minimum: 1.0,
    },
  })

  useEffect(() => {
    if (data?.data) {
      form.reset({
        platform_fee_percentage: data.data.platform_fee_percentage,
        delivery_fee_per_km: data.data.delivery_fee_per_km,
        delivery_fee_minimum: data.data.delivery_fee_minimum,
      })
    }
  }, [data, form])

  function onSubmit(values: FormValues) {
    update.mutate(values, {
      onSuccess: () => toast.success('Payment settings saved.'),
      onError: () => toast.error('Failed to save settings.'),
    })
  }

  return (
    <>
      <Header fixed>
        <div className='flex flex-1 items-center'>
          <h1 className='text-lg font-semibold'>Payment Settings</h1>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='max-w-2xl space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Payment & Delivery</h2>
          <p className='text-muted-foreground'>
            Configure platform fee and delivery pricing applied to all orders.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                    <CardTitle className='text-base'>Platform Fee</CardTitle>
                  </div>
                  <CardDescription>
                    Percentage deducted from the store payout on each order. Not shown to clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='platform_fee_percentage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee Percentage (%)</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='number'
                              step='0.1'
                              min='0'
                              max='100'
                              className='pe-8'
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                            <span className='absolute end-3 top-2.5 text-sm text-muted-foreground'>
                              %
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          E.g. 10 means 10% of the order subtotal is taken as platform revenue.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-2'>
                    <Truck className='h-4 w-4 text-muted-foreground' />
                    <CardTitle className='text-base'>Delivery Pricing</CardTitle>
                  </div>
                  <CardDescription>
                    Delivery fee is calculated as: max(minimum, minimum + distance × per km rate).
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='delivery_fee_per_km'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee per km (JOD)</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              className='pe-14'
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                            <span className='absolute end-3 top-2.5 text-sm text-muted-foreground'>
                              JOD/km
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='delivery_fee_minimum'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Delivery Fee (JOD)</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              className='pe-12'
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                            <span className='absolute end-3 top-2.5 text-sm text-muted-foreground'>
                              JOD
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Orders within a short radius still pay at least this amount.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className='flex justify-end'>
                <Button type='submit' disabled={update.isPending}>
                  {update.isPending && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        )}
      </Main>
    </>
  )
}
