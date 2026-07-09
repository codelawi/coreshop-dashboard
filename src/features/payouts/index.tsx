import { useState } from 'react'
import { Loader2, TrendingUp, Store, BadgeDollarSign, Clock } from 'lucide-react'
import { useAdminStores } from '@/hooks/api/use-stores'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const PLATFORM_FEE_RATE = 0.1

function fmt(v: number) {
  return `JOD ${v.toFixed(2)}`
}

export function Payouts() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useAdminStores({ per_page: 100 })
  const allStores: any[] = data?.data ?? []

  const stores = allStores
    .filter((s) => s.total_revenue != null && Number(s.total_revenue) > 0)
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      if (statusFilter === 'all') return true
      return s.status === statusFilter
    })

  const totalRevenue = stores.reduce(
    (acc, s) => acc + Number(s.total_revenue ?? 0),
    0
  )
  const totalFees = totalRevenue * PLATFORM_FEE_RATE
  const totalPayouts = totalRevenue - totalFees

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Platform Payouts</h1>
          <p className='text-sm text-muted-foreground'>
            Overview of seller revenue, platform fees, and outstanding payouts.
          </p>
        </div>

        {/* Summary cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total GMV
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{fmt(totalRevenue)}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Gross merchandise value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Platform Fees (10%)
              </CardTitle>
              <BadgeDollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{fmt(totalFees)}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Commission retained by platform
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Seller Payouts
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{fmt(totalPayouts)}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Amount owed to sellers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <Input
            placeholder='Search stores...'
            className='h-8 w-56'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-8 w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='suspended'>Suspended</SelectItem>
              <SelectItem value='closed'>Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : stores.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <Store className='h-10 w-10 opacity-30' />
            <p className='text-sm'>No payout data available.</p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Total Revenue</TableHead>
                  <TableHead className='text-right'>Platform Fee (10%)</TableHead>
                  <TableHead className='text-right'>Seller Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => {
                  const revenue = Number(store.total_revenue ?? 0)
                  const fee = revenue * PLATFORM_FEE_RATE
                  const payout = revenue - fee
                  return (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8 rounded-lg'>
                            <AvatarImage
                              src={store.logo ?? undefined}
                              alt={store.name}
                            />
                            <AvatarFallback className='rounded-lg text-xs'>
                              {store.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium leading-none'>
                              {store.name}
                            </p>
                            {store.city && (
                              <p className='mt-0.5 text-xs text-muted-foreground'>
                                {store.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm font-medium'>
                            {store.seller?.name ?? '—'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {store.seller?.email ?? ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={
                            store.status === 'active'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : store.status === 'suspended'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                          }
                        >
                          {store.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right text-sm font-medium'>
                        {fmt(revenue)}
                      </TableCell>
                      <TableCell className='text-right text-sm text-muted-foreground'>
                        {fmt(fee)}
                      </TableCell>
                      <TableCell className='text-right text-sm font-semibold text-green-700'>
                        {fmt(payout)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>
    </>
  )
}
