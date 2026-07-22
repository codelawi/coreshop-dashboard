import { Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAnalyticsCategories } from '@/hooks/api/use-analytics'

const PALETTE = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

function compactNum(n: number) {
  if (n >= 1_000_000) return `JOD ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `JOD ${(n / 1_000).toFixed(1)}K`
  return `JOD ${n.toFixed(0)}`
}

interface CategoryItem {
  category: string
  revenue: number
  orders: number
}

function BarLabel(props: any) {
  const { x, y, width, height, value } = props
  if (!value || width < 40) return null
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      fontSize={11}
      fill='var(--color-muted-foreground)'
      textAnchor='start'
    >
      {compactNum(value)}
    </text>
  )
}

export function SalesByCategoryChart() {
  const { data, isLoading } = useAnalyticsCategories()
  const items: CategoryItem[] = data?.data ?? []

  const chartData = items.map((item, i) => ({
    name:
      item.category.length > 14
        ? item.category.slice(0, 14) + '…'
        : item.category,
    fullName: item.category,
    revenue: item.revenue,
    orders: item.orders,
    color: PALETTE[i % PALETTE.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Revenue generated per product category</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>No sales data yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
            >
              <defs>
                {chartData.map((d, i) => (
                  <linearGradient
                    key={i}
                    id={`cat-grad-${i}`}
                    x1='0'
                    y1='0'
                    x2='1'
                    y2='0'
                  >
                    <stop offset='0%' stopColor={d.color} stopOpacity={1} />
                    <stop offset='100%' stopColor={d.color} stopOpacity={0.5} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis type='number' hide />
              <YAxis
                type='category'
                dataKey='name'
                width={100}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-popover-foreground)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, _name: string, props: any) => [
                  `JOD ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · ${props.payload.orders} orders`,
                  props.payload.fullName,
                ]}
              />
              <Bar dataKey='revenue' radius={[0, 6, 6, 0]} label={<BarLabel />}>
                {chartData.map((_d, i) => (
                  <Cell key={i} fill={`url(#cat-grad-${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
