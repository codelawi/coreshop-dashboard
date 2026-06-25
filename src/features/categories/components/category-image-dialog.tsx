import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateCategory } from '@/hooks/api/use-categories-admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUploadField } from '../../banners/components/image-upload-field'
import type { Category } from '../data/schema'

interface CategoryImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export function CategoryImageDialog({ open, onOpenChange, category }: CategoryImageDialogProps) {
  const [image, setImage] = useState('')
  const updateCategory = useUpdateCategory()

  useEffect(() => {
    if (open && category) {
      setImage(category.image ?? '')
    }
  }, [open, category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    updateCategory.mutate(
      { id: category.id, image },
      {
        onSuccess: () => { toast.success('Category image updated.'); onOpenChange(false) },
        onError: () => toast.error('Failed to update category.'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Image — {category?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <ImageUploadField
            label='Category Image'
            value={image}
            onChange={setImage}
            folder='categories'
          />
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={updateCategory.isPending || !image}>
              {updateCategory.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
