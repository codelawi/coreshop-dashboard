import { Loader2 } from 'lucide-react'
import { useOrders } from '@/hooks/api/use-orders'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrdersTable } from './components/orders-table'
import type { Order } from './data/schema'

export function Orders() {
  const { data, isLoading } = useOrders({ per_page: 100 })
  const orders: Order[] = data?.data ?? []

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Orders</h1>
          <p className='text-sm text-muted-foreground'>
            View and manage all platform orders.
          </p>
        </div>
        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <OrdersTable data={orders} />
        )}
      </Main>
    </>
  )
}
