import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { OrdersChart } from './components/orders-chart'
import { OrdersStatusChart } from './components/orders-status-chart'
import { RevenueChart } from './components/revenue-chart'
import { TopProductsChart } from './components/top-products-chart'
import { TopSellersTable } from './components/top-sellers-table'
import { UsersGrowthChart } from './components/users-growth-chart'

export function Analytics() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Analytics</h2>
          <p className='text-muted-foreground'>
            Platform-wide revenue, orders, users and seller insights.
          </p>
        </div>

        {/* Row 1 — Revenue + Orders */}
        <div className='grid gap-4 lg:grid-cols-2'>
          <RevenueChart />
          <OrdersChart />
        </div>

        {/* Row 2 — Orders Status + Users Growth */}
        <div className='grid gap-4 lg:grid-cols-2'>
          <OrdersStatusChart />
          <UsersGrowthChart />
        </div>

        {/* Row 3 — Top Products + Top Sellers */}
        <div className='grid gap-4 lg:grid-cols-2'>
          <TopProductsChart />
          <TopSellersTable />
        </div>
      </Main>
    </>
  )
}
