import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { Ban, Eye, Pencil, ShieldOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const user = row.original
  const { setOpen, setCurrentRow } = useUsers()
  const isBanned = user.status === 'suspended'

  const handleAction = (action: 'edit' | 'ban' | 'delete' | 'profile') => {
    setCurrentRow(user)
    setOpen(action)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem onClick={() => handleAction('profile')}>
          <Eye className='mr-2 h-4 w-4' />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit')}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('ban')}>
          {isBanned ? (
            <>
              <ShieldOff className='mr-2 h-4 w-4 text-green-600' />
              Unban Account
            </>
          ) : (
            <>
              <Ban className='mr-2 h-4 w-4' />
              Ban Account
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
