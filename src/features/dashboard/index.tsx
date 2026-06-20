import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react'
import { useAnalyticsOverview } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

function formatCurrency(value: number | null | undefined) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n)
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US').format(Number(value ?? 0))
}

export function Dashboard() {
  const { data, isLoading } = useAnalyticsOverview()
  const overview = data?.data

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(overview?.total_revenue),
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: formatNumber(overview?.total_orders),
      icon: ShoppingCart,
    },
    {
      title: 'Active Users',
      value: formatNumber(overview?.total_users),
      icon: Users,
    },
    {
      title: 'Active Products',
      value: formatNumber(overview?.total_products),
      icon: Package,
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(overview?.avg_order_value),
      icon: TrendingUp,
    },
    {
      title: 'Pending Orders',
      value: formatNumber(overview?.pending_orders),
      icon: Clock,
    },
  ]

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
          <h1 className='text-2xl font-bold tracking-tight'>Overview</h1>
          <p className='text-sm text-muted-foreground'>
            Welcome back! Here's what's happening with CoreShop today.
          </p>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            {/* KPI Cards */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {kpis.map((kpi) => (
                <Card key={kpi.title}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {kpi.title}
                    </CardTitle>
                    <kpi.icon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {isLoading ? (
                        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                      ) : (
                        kpi.value
                      )}
                    </div>
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
                    Monthly revenue for the current year
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Latest 5 orders across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='analytics'>
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics coming soon.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
