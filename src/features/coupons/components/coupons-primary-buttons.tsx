import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCoupons } from './coupons-provider'

export function CouponsPrimaryButtons() {
  const { setOpen } = useCoupons()
  return (
    <Button onClick={() => setOpen('create')} size='sm'>
      <Plus className='mr-2 h-4 w-4' />
      Create Coupon
    </Button>
  )
}
