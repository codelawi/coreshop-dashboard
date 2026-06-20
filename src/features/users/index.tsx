import { Loader2 } from 'lucide-react'
import { useUsers } from '@/hooks/api/use-users'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersTable } from './components/users-table'
import type { User } from './data/schema'

export function Users() {
  const { data, isLoading } = useUsers({ per_page: 100 })
  const users: User[] = data?.data ?? []

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
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
    </>
  )
}
