import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Loader2,
  Banknote,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAnalyticsOverview } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

function compact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US').format(n)
}

function fmtCurrency(value: number | null | undefined) {
  const n = Number(value ?? 0)
  return {
    short: `JOD ${compact(n)}`,
    full: `JOD ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`,
  }
}

function fmtNumber(value: number | null | undefined) {
  const n = Number(value ?? 0)
  return { short: compact(n), full: new Intl.NumberFormat('en-US').format(n) }
}

interface KpiConfig {
  title: string
  short: string
  full: string
  icon: React.ElementType
  description: string
  color: string
  iconBg: string
  extra?: { label: string; value: string }
}

export function Dashboard() {
  const { data, isLoading } = useAnalyticsOverview()
  const overview = data?.data

  const revenue = fmtCurrency(overview?.total_revenue)
  const platformFee = fmtCurrency(overview?.total_platform_fee)

  const kpis: KpiConfig[] = [
    {
      title: 'Total Revenue',
      ...revenue,
      icon: DollarSign,
      description: 'Gross revenue from delivered & completed orders',
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950',
      extra: { label: 'Platform Fee', value: platformFee.full },
    },
    {
      title: 'Total Orders',
      ...fmtNumber(overview?.total_orders),
      icon: ShoppingCart,
      description: 'All orders placed across the platform',
      color: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Users',
      ...fmtNumber(overview?.total_users),
      icon: Users,
      description: 'Registered customers and sellers',
      color: 'text-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Active Products',
      ...fmtNumber(overview?.total_products),
      icon: Package,
      description: 'Approved products available in the marketplace',
      color: 'text-orange-600',
      iconBg: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Avg. Order Value',
      ...fmtCurrency(overview?.avg_order_value),
      icon: TrendingUp,
      description: 'Average spend per completed order',
      color: 'text-cyan-600',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      title: 'Pending Orders',
      ...fmtNumber(overview?.pending_orders),
      icon: Clock,
      description: 'Orders awaiting approval or processing',
      color: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

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
          <h1 className='text-2xl font-bold tracking-tight'>Overview</h1>
          <p className='text-sm text-muted-foreground'>
            Welcome back! Here's what's happening with CoreShop today.
          </p>
        </div>

        <div className='space-y-4'>
          {/* KPI Cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {kpis.map((kpi) => (
              <Card key={kpi.title} className='overflow-hidden'>
                <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                  <div>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      {kpi.title}
                    </CardTitle>
                  </div>
                  <div className={`rounded-lg p-2 ${kpi.iconBg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold tracking-tight ${kpi.color}`}>
                        {kpi.short}
                      </div>
                      {kpi.short !== kpi.full && (
                        <p className='mt-0.5 text-xs text-muted-foreground'>{kpi.full}</p>
                      )}
                      {kpi.extra && (
                        <div className='mt-2 flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1'>
                          <Banknote className='h-3 w-3 text-muted-foreground' />
                          <span className='text-xs text-muted-foreground'>
                            {kpi.extra.label}:{' '}
                            <span className='font-medium text-foreground'>
                              {kpi.extra.value}
                            </span>
                          </span>
                        </div>
                      )}
                      <p className='mt-2 text-xs text-muted-foreground'>{kpi.description}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts + Recent Orders */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <Card className='col-span-1 lg:col-span-4'>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue trend for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className='ps-2'>
                <Overview />
              </CardContent>
            </Card>
            <Card className='col-span-1 lg:col-span-3'>
              <CardHeader className='flex flex-row items-start justify-between'>
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Latest 5 orders across the platform
                  </CardDescription>
                </div>
                <Button variant='ghost' size='sm' asChild className='-mt-1'>
                  <Link to='/orders'>View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
