import { Loader2, MapPin } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAnalyticsCities } from '@/hooks/api/use-analytics'

const RANK_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

interface CityItem {
  city: string
  orders: number
}

export function TopCitiesChart() {
  const { data, isLoading } = useAnalyticsCities()
  const cities: CityItem[] = data?.data ?? []
  const maxOrders = Math.max(...cities.map((c) => c.orders), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Cities by Orders</CardTitle>
        <CardDescription>
          Cities generating the most platform orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : cities.length === 0 ? (
          <div className='flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground'>
            <MapPin className='h-8 w-8 opacity-20' />
            <p className='text-sm'>No city data yet.</p>
          </div>
        ) : (
          <div className='space-y-4 pt-2'>
            {cities.map((city, i) => {
              const pct = (city.orders / maxOrders) * 100
              const color = RANK_COLORS[i % RANK_COLORS.length]
              return (
                <div key={city.city} className='flex items-center gap-3'>
                  <div
                    className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm'
                    style={{ background: color }}
                  >
                    {i + 1}
                  </div>
                  <div className='flex-1 space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{city.city}</span>
                      <span className='text-xs font-semibold text-muted-foreground'>
                        {city.orders.toLocaleString()} orders
                      </span>
                    </div>
                    <div className='h-2 overflow-hidden rounded-full bg-muted/60'>
                      <div
                        className='h-full rounded-full transition-all duration-700'
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
