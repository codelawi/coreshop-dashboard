import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteBanner } from '@/hooks/api/use-banners'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Banner } from '../data/schema'

interface BannersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: Banner | null
}

export function BannersDeleteDialog({ open, onOpenChange, banner }: BannersDeleteDialogProps) {
  const deleteBanner = useDeleteBanner()

  const handleDelete = () => {
    if (!banner) return
    deleteBanner.mutate(banner.id, {
      onSuccess: () => { toast.success('Banner deleted.'); onOpenChange(false) },
      onError: () => toast.error('Failed to delete banner.'),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{banner?.title}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={handleDelete}
            disabled={deleteBanner.isPending}
          >
            {deleteBanner.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
