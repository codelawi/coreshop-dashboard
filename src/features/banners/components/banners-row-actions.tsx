import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Loader2, Pencil, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useToggleBanner } from '@/hooks/api/use-banners'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Banner } from '../data/schema'
import { useBannersContext } from './banners-provider'

export function BannersRowActions({ banner }: { banner: Banner }) {
  const { setOpen, setCurrentRow } = useBannersContext()
  const toggle = useToggleBanner()

  const handleToggle = () => {
    toggle.mutate(banner.id, {
      onSuccess: () => toast.success(`Banner ${banner.is_active ? 'deactivated' : 'activated'}.`),
      onError: () => toast.error('Failed to update banner.'),
    })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          disabled={toggle.isPending}
        >
          {toggle.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <DotsHorizontalIcon className='h-4 w-4' />
          )}
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => { setCurrentRow(banner); setOpen('edit') }}
        >
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle}>
          <Power className='mr-2 h-4 w-4' />
          {banner.is_active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => { setCurrentRow(banner); setOpen('delete') }}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
