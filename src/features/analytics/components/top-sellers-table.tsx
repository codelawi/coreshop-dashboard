import { Loader2 } from 'lucide-react'
import { useAnalyticsTopSellers } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Seller {
  id: number
  name: string
  email: string
  revenue: number
  orders: number
}

export function TopSellersTable() {
  const { data, isLoading } = useAnalyticsTopSellers()
  const sellers: Seller[] = data?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Sellers</CardTitle>
        <CardDescription>
          Best performing sellers on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[200px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : sellers.length === 0 ? (
          <div className='flex h-[200px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No sellers yet.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {sellers.map((seller, index) => (
              <div
                key={seller.id}
                className='flex items-center justify-between gap-4'
              >
                <div className='flex items-center gap-3'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold'>
                    {index + 1}
                  </span>
                  <div>
                    <p className='text-sm font-medium'>{seller.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {seller.email}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-4 text-sm'>
                  <span className='text-muted-foreground'>
                    {seller.orders} orders
                  </span>
                  <span className='font-medium'>
                    ${seller.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
