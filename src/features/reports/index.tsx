import { useEffect, useState } from 'react'
import { Bug, Loader2, MessageSquareWarning } from 'lucide-react'
import { toast } from 'sonner'
import { useMarkAllNotificationsRead } from '@/hooks/api/use-dashboard-notifications'
import { type Report, useReports, useUpdateReportStatus } from '@/hooks/api/use-reports'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function typeBadge(type: Report['type']) {
  if (type === 'bug') {
    return (
      <Badge variant='outline' className='border-red-200 bg-red-50 text-red-700'>
        <Bug className='me-1 h-3 w-3' />
        Bug
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='border-orange-200 bg-orange-50 text-orange-700'>
      <MessageSquareWarning className='me-1 h-3 w-3' />
      Problem
    </Badge>
  )
}

function statusBadge(status: Report['status']) {
  if (status === 'new') {
    return (
      <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700'>
        New
      </Badge>
    )
  }
  if (status === 'in_progress') {
    return (
      <Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700'>
        In Progress
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700'>
      Resolved
    </Badge>
  )
}

export function Reports() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useReports({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    per_page: 100,
  })

  const updateStatus = useUpdateReportStatus()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

  const reports: Report[] = data?.data ?? []

  function handleStatusChange(id: number, status: string) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success('Status updated.'),
        onError: () => toast.error('Failed to update status.'),
      }
    )
  }

  useEffect(() => {
    markAllRead('new_feedback' as never)
  }, [markAllRead])

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>User Reports</h1>
          <p className='text-sm text-muted-foreground'>
            Bug reports and problems submitted by mobile app users.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='h-8 w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              <SelectItem value='bug'>Bug reports</SelectItem>
              <SelectItem value='problem'>Problems</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-8 w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='new'>New</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='resolved'>Resolved</SelectItem>
            </SelectContent>
          </Select>

          <span className='ms-auto text-sm text-muted-foreground'>
            {data?.meta.total ?? 0} reports
          </span>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : reports.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <MessageSquareWarning className='h-10 w-10 opacity-30' />
            <p className='text-sm'>No reports found.</p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-7 w-7'>
                          {report.user?.avatar && (
                            <AvatarImage src={report.user.avatar} />
                          )}
                          <AvatarFallback className='text-xs'>
                            {report.user ? getInitials(report.user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium leading-none'>
                            {report.user?.name ?? '—'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {report.user?.email ?? '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{typeBadge(report.type)}</TableCell>
                    <TableCell className='max-w-64'>
                      <p className='truncate text-sm text-muted-foreground'>
                        {report.description}
                      </p>
                    </TableCell>
                    <TableCell className='max-w-48'>
                      {report.steps ? (
                        <p className='truncate text-sm text-muted-foreground'>
                          {report.steps}
                        </p>
                      ) : (
                        <span className='text-xs italic text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {report.created_at}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {statusBadge(report.status)}
                        <Select
                          value={report.status}
                          onValueChange={(v) => handleStatusChange(report.id, v)}
                        >
                          <SelectTrigger className='h-7 w-28 text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='new'>New</SelectItem>
                            <SelectItem value='in_progress'>In Progress</SelectItem>
                            <SelectItem value='resolved'>Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
