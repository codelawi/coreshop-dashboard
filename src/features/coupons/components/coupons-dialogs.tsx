import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from '@/hooks/api/use-coupons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { couponFormSchema, type CouponForm } from '../data/schema'
import { useCoupons } from './coupons-provider'

const defaultValues: CouponForm = {
  code: '',
  type: 'percentage',
  value: 0,
  min_order_amount: 0,
  usage_limit: 1,
  expires_at: '',
  active: true,
}

export function CouponsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCoupons()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const deleteCoupon = useDeleteCoupon()

  const form = useForm<CouponForm>({
    resolver: zodResolver(couponFormSchema) as Resolver<CouponForm>,
    defaultValues,
  })

  useEffect(() => {
    if (open === 'edit' && currentRow) {
      form.reset({
        code: currentRow.code,
        type: currentRow.type,
        value: Number(currentRow.value),
        min_order_amount: Number(currentRow.min_order_amount),
        usage_limit: currentRow.usage_limit,
        expires_at: currentRow.expires_at ?? '',
        active: currentRow.active,
      })
    } else if (open === 'create') {
      form.reset(defaultValues)
    }
  }, [open, currentRow, form])

  const handleClose = () => {
    setOpen(null)
    setCurrentRow(null)
    form.reset(defaultValues)
  }

  const onSubmit = (data: CouponForm) => {
    const payload = {
      ...data,
      code: data.code.toUpperCase(),
      expires_at: data.expires_at || null,
    }

    if (open === 'edit' && currentRow) {
      updateCoupon.mutate(
        { id: currentRow.id, ...payload },
        {
          onSuccess: () => {
            toast.success(`Coupon ${payload.code} updated.`)
            handleClose()
          },
          onError: () => {
            toast.error('Failed to update coupon.')
          },
        }
      )
    } else {
      createCoupon.mutate(payload, {
        onSuccess: () => {
          toast.success(`Coupon ${payload.code} created.`)
          handleClose()
        },
        onError: (err: unknown) => {
          const error = err as {
            response?: { data?: { errors?: Record<string, string[]> } }
          }
          const firstError = error.response?.data?.errors
            ? Object.values(error.response.data.errors)[0]?.[0]
            : null
          toast.error(firstError ?? 'Failed to create coupon.')
        },
      })
    }
  }

  const handleDelete = () => {
    if (!currentRow) return
    deleteCoupon.mutate(currentRow.id, {
      onSuccess: () => {
        toast.success(`Coupon ${currentRow.code} deleted.`)
        handleClose()
      },
      onError: () => {
        toast.error('Failed to delete coupon.')
      },
    })
  }

  const isFormOpen = open === 'create' || open === 'edit'
  const isPending = createCoupon.isPending || updateCoupon.isPending

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {open === 'edit' ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
            <DialogDescription>
              {open === 'edit'
                ? 'Update the coupon details below.'
                : 'Add a new promo code to the platform.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid gap-4 py-2'
            >
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='SUMMER25' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-3'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='percentage'>Percentage</SelectItem>
                          <SelectItem value='fixed'>Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='value'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <FormField
                  control={form.control}
                  name='min_order_amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Order</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='usage_limit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='expires_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At (optional)</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-md border p-3'>
                    <FormLabel className='mb-0'>Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className='gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {open === 'edit' ? 'Save Changes' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={open === 'delete'}
        onOpenChange={(o) => !o && handleClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the coupon{' '}
              <span className='font-mono font-medium'>{currentRow?.code}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCoupon.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCoupon.isPending}
              className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            >
              {deleteCoupon.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
