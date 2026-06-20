import { Loader2 } from 'lucide-react'
import { useCoupons as useCouponsQuery } from '@/hooks/api/use-coupons'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CouponsDialogs } from './components/coupons-dialogs'
import { CouponsPrimaryButtons } from './components/coupons-primary-buttons'
import { CouponsProvider } from './components/coupons-provider'
import { CouponsTable } from './components/coupons-table'
import type { Coupon } from './data/schema'

export function Coupons() {
  const { data, isLoading } = useCouponsQuery({ per_page: 100 })
  const coupons: Coupon[] = data?.data ?? []

  return (
    <CouponsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Coupons & Discounts
            </h2>
            <p className='text-muted-foreground'>
              Manage platform-wide promo codes and discounts.
            </p>
          </div>
          <CouponsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <CouponsTable data={coupons} />
        )}
      </Main>

      <CouponsDialogs />
    </CouponsProvider>
  )
}
