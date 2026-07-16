import { useState, useMemo, useEffect } from 'react'
import { Loader2, CalendarDays } from 'lucide-react'
import { useOrders } from '@/hooks/api/use-orders'
import { useMarkAllNotificationsRead } from '@/hooks/api/use-dashboard-notifications'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrdersTable } from './components/orders-table'
import type { Order } from './data/schema'

export function Orders() {
  const { data, isLoading } = useOrders({ per_page: 100 })
  const orders: Order[] = data?.data ?? []
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    markAllRead.mutate('new_order')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const d = o.created_at?.slice(0, 10) ?? ''
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    })
  }, [orders, dateFrom, dateTo])

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Orders</h1>
          <p className='text-sm text-muted-foreground'>
            View and manage all platform orders.
          </p>
        </div>

        {/* Date range filter */}
        <div className='mb-4 flex flex-wrap items-end gap-4'>
          <div className='flex items-end gap-2'>
            <CalendarDays className='mb-2 h-4 w-4 text-muted-foreground' />
            <div className='flex flex-col gap-1'>
              <Label className='text-xs text-muted-foreground'>From</Label>
              <Input
                type='date'
                className='h-8 w-36 text-sm'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label className='text-xs text-muted-foreground'>To</Label>
              <Input
                type='date'
                className='h-8 w-36 text-sm'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                className='mb-1 text-xs text-muted-foreground underline hover:text-foreground'
                onClick={() => { setDateFrom(''); setDateTo('') }}
              >
                Clear
              </button>
            )}
          </div>
          {(dateFrom || dateTo) && (
            <span className='mb-1 text-xs text-muted-foreground'>
              Showing {filtered.length} of {orders.length} orders
            </span>
          )}
        </div>

        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <OrdersTable data={filtered} />
        )}
      </Main>
    </>
  )
}
