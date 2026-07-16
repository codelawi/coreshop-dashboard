import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useUsers } from '@/hooks/api/use-users'
import { useMarkAllNotificationsRead } from '@/hooks/api/use-dashboard-notifications'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersTable } from './components/users-table'
import { UsersProvider } from './components/users-provider'
import type { User } from './data/schema'

export function Users() {
  const { data, isLoading } = useUsers({ per_page: 100 })
  const users: User[] = data?.data ?? []
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    markAllRead.mutate('new_user')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
            <p className='text-muted-foreground'>
              Manage buyers, sellers, and drivers — change account status.
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <UsersTable data={users} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
