import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateUserStatus } from '@/hooks/api/use-users'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User, UserStatus } from '../data/schema'

type DataTableRowActionsProps = {
  row: Row<User>
}

const statusOptions: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Mark as Active' },
  { value: 'inactive', label: 'Mark as Inactive' },
  { value: 'suspended', label: 'Suspend' },
]

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const user = row.original
  const updateStatus = useUpdateUserStatus()

  const handleChange = (status: UserStatus) => {
    if (status === user.status) return
    updateStatus.mutate(
      { id: user.id, status },
      {
        onSuccess: () => {
          toast.success(`${user.name} is now ${status}.`)
        },
        onError: () => {
          toast.error('Failed to update user status.')
        },
      }
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <DotsHorizontalIcon className='h-4 w-4' />
          )}
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Change status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            disabled={opt.value === user.status}
            onClick={() => handleChange(opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
