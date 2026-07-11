import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle,
  Globe,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldOff,
  Zap,
} from 'lucide-react'
import {
  type SecurityEventType,
  useSecurityEvents,
  useSecurityStats,
} from '@/hooks/api/use-security-events'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

const TYPE_LABELS: Record<SecurityEventType, string> = {
  failed_login: 'Failed Login',
  rate_limited: 'Rate Limited',
  unauthorized: 'Unauthorized',
}

const TYPE_VARIANTS: Record<
  SecurityEventType,
  'destructive' | 'secondary' | 'outline'
> = {
  failed_login: 'destructive',
  rate_limited: 'secondary',
  unauthorized: 'outline',
}

const TYPE_ICONS: Record<SecurityEventType, React.ReactNode> = {
  failed_login: <ShieldOff className='h-3 w-3' />,
  rate_limited: <Zap className='h-3 w-3' />,
  unauthorized: <AlertTriangle className='h-3 w-3' />,
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: number | undefined
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        ) : (
          <p className='text-2xl font-bold'>{(value ?? 0).toLocaleString()}</p>
        )}
        <p className='mt-1 text-xs text-muted-foreground'>Last 24 hours</p>
      </CardContent>
    </Card>
  )
}

function parseDevice(ua: string | null): string {
  if (!ua) { return '—' }
  if (ua.includes('Mobile')) { return 'Mobile' }
  if (ua.includes('Tablet')) { return 'Tablet' }
  if (ua.includes('curl')) { return 'curl' }
  return 'Desktop'
}

export function Security() {
  const [typeFilter, setTypeFilter] = useState<SecurityEventType | ''>('')
  const [ipFilter, setIpFilter] = useState('')
  const [ipSearch, setIpSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: stats, isLoading: statsLoading } = useSecurityStats()
  const { data, isLoading } = useSecurityEvents({
    type: typeFilter || undefined,
    ip: ipFilter || undefined,
    page,
  })

  const events = data?.data ?? []
  const meta = data?.meta

  function applyIpFilter() {
    setIpFilter(ipSearch.trim())
    setPage(1)
  }

  function clearFilters() {
    setTypeFilter('')
    setIpFilter('')
    setIpSearch('')
    setPage(1)
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center gap-2'>
        <Shield className='h-6 w-6' />
        <h1 className='text-2xl font-bold'>Security</h1>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Events'
          value={stats?.total}
          icon={<ShieldAlert className='h-4 w-4 text-muted-foreground' />}
          loading={statsLoading}
        />
        <StatCard
          title='Failed Logins'
          value={stats?.failed_login}
          icon={<ShieldOff className='h-4 w-4 text-destructive' />}
          loading={statsLoading}
        />
        <StatCard
          title='Rate Limited'
          value={stats?.rate_limited}
          icon={<Zap className='h-4 w-4 text-yellow-500' />}
          loading={statsLoading}
        />
        <StatCard
          title='Unique IPs'
          value={stats?.unique_ips}
          icon={<Globe className='h-4 w-4 text-muted-foreground' />}
          loading={statsLoading}
        />
      </div>

      {/* Top attacking IPs */}
      {stats?.top_ips && stats.top_ips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Top IPs (last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {stats.top_ips.map((entry) => (
                <button
                  key={entry.ip_address}
                  onClick={() => {
                    setIpSearch(entry.ip_address)
                    setIpFilter(entry.ip_address)
                    setPage(1)
                  }}
                  className='flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted'
                >
                  <span className='font-mono font-medium'>
                    {entry.ip_address}
                  </span>
                  {entry.country && (
                    <span className='text-muted-foreground'>
                      {entry.country}
                    </span>
                  )}
                  <Badge variant='secondary' className='h-4 px-1 text-[10px]'>
                    {entry.total}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        <Select
          value={typeFilter || 'all'}
          onValueChange={(v) => {
            setTypeFilter(v === 'all' ? '' : (v as SecurityEventType))
            setPage(1)
          }}
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='All types' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='failed_login'>Failed Login</SelectItem>
            <SelectItem value='rate_limited'>Rate Limited</SelectItem>
            <SelectItem value='unauthorized'>Unauthorized</SelectItem>
          </SelectContent>
        </Select>

        <div className='flex gap-2'>
          <Input
            placeholder='Filter by IP…'
            value={ipSearch}
            onChange={(e) => setIpSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyIpFilter()}
            className='w-44'
          />
          <button
            onClick={applyIpFilter}
            className='rounded-md border px-3 text-sm hover:bg-muted'
          >
            Search
          </button>
        </div>

        {(typeFilter || ipFilter) && (
          <button
            onClick={clearFilters}
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Clear filters
          </button>
        )}

        {meta && (
          <span className='ml-auto text-sm text-muted-foreground'>
            {meta.total.toLocaleString()} events
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex h-48 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : events.length === 0 ? (
            <div className='flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Shield className='h-8 w-8 opacity-20' />
              <p className='text-sm'>No security events found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className='whitespace-nowrap text-xs text-muted-foreground'>
                      <span title={format(new Date(event.created_at), 'PPpp')}>
                        {formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={TYPE_VARIANTS[event.type]}
                        className='gap-1'
                      >
                        {TYPE_ICONS[event.type]}
                        {TYPE_LABELS[event.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          setIpSearch(event.ip_address)
                          setIpFilter(event.ip_address)
                          setPage(1)
                        }}
                        className='font-mono text-xs hover:underline'
                      >
                        {event.ip_address}
                      </button>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {event.country ?? '—'}
                    </TableCell>
                    <TableCell className='max-w-[200px] truncate font-mono text-xs'>
                      <span className='mr-1 text-muted-foreground'>
                        {event.method}
                      </span>
                      {event.path}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {parseDevice(event.user_agent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className='rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted'
          >
            Previous
          </button>
          <span className='text-sm text-muted-foreground'>
            Page {page} of {meta.last_page}
          </span>
          <button
            disabled={page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className='rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted'
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
