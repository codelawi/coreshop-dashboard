import { useState } from 'react'
import { Loader2, Truck, Search, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useUsers, useUpdateUserStatus } from '@/hooks/api/use-users'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

const STATUS_COLORS: Record<string, string> = {
  active: 'border-green-200 bg-green-50 text-green-700',
  inactive: 'border-gray-200 bg-gray-50 text-gray-600',
  suspended: 'border-red-200 bg-red-50 text-red-700',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Drivers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useUsers({
    role: 'driver',
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: 100,
  })

  const updateStatus = useUpdateUserStatus()
  const drivers: any[] = data?.data ?? []

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success('Driver status updated.'),
        onError: () => toast.error('Failed to update status.'),
      }
    )
  }

  return (
    <>
      <Header>
        <div className='flex flex-1 items-center gap-2'>
          <div className='relative w-64'>
            <Search className='absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search drivers...'
              className='ps-8'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
              <SelectItem value='suspended'>Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Drivers</h1>
          <p className='text-sm text-muted-foreground'>
            Manage delivery drivers on the platform.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : drivers.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <Truck className='h-10 w-10 opacity-30' />
            <p className='text-sm'>No drivers found.</p>
            <p className='max-w-xs text-center text-xs text-muted-foreground'>
              Drivers with the <code>driver</code> role will appear here once
              they register on the platform.
            </p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback className='text-xs'>
                            {getInitials(driver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium leading-none'>
                            {driver.name}
                          </p>
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            {driver.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {driver.phone ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={`capitalize ${STATUS_COLORS[driver.status] ?? ''}`}
                      >
                        {driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {driver.created_at}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {driver.status !== 'active' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(driver.id, 'active')
                              }
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                          {driver.status !== 'suspended' && (
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={() =>
                                handleStatusChange(driver.id, 'suspended')
                              }
                            >
                              Suspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>
    </>
  )
}
