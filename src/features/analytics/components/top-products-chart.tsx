import { Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalyticsTopProducts } from '@/hooks/api/use-analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ProductPoint {
  id: number
  name: string
  sales: number
}

export function TopProductsChart() {
  const { data, isLoading } = useAnalyticsTopProducts()
  const products: ProductPoint[] = data?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          Best performing products by units sold
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : products.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No sales yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={products} layout='vertical'>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis
                type='number'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='hsl(var(--muted-foreground))'
              />
              <YAxis
                type='category'
                dataKey='name'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke='hsl(var(--muted-foreground))'
                width={140}
              />
              <Tooltip formatter={(v) => [v, 'Units Sold']} />
              <Bar
                dataKey='sales'
                fill='hsl(var(--primary))'
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
