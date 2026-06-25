import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateBanner, useUpdateBanner } from '@/hooks/api/use-banners'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Banner } from '../data/schema'
import { ImageUploadField } from './image-upload-field'

interface BannersActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner?: Banner | null
}

const defaultForm = {
  title: '',
  subtitle: '',
  image: '',
  link_type: 'category' as const,
  link_value: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
}

export function BannersActionDialog({ open, onOpenChange, banner }: BannersActionDialogProps) {
  const isEdit = !!banner
  const [form, setForm] = useState(defaultForm)

  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const isPending = createBanner.isPending || updateBanner.isPending

  useEffect(() => {
    if (open) {
      if (banner) {
        setForm({
          title: banner.title,
          subtitle: banner.subtitle ?? '',
          image: banner.image,
          link_type: banner.link_type,
          link_value: banner.link_value,
          is_active: !!banner.is_active,
          starts_at: banner.starts_at ? banner.starts_at.slice(0, 10) : '',
          ends_at: banner.ends_at ? banner.ends_at.slice(0, 10) : '',
        })
      } else {
        setForm(defaultForm)
      }
    }
  }, [open, banner])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      subtitle: form.subtitle || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    }
    if (isEdit && banner) {
      updateBanner.mutate(
        { id: banner.id, ...payload },
        {
          onSuccess: () => { toast.success('Banner updated.'); onOpenChange(false) },
          onError: () => toast.error('Failed to update banner.'),
        }
      )
    } else {
      createBanner.mutate(payload, {
        onSuccess: () => { toast.success('Banner created.'); onOpenChange(false) },
        onError: () => toast.error('Failed to create banner.'),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Title</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='Mega Sale'
            />
          </div>

          <div className='space-y-2'>
            <Label>Subtitle</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder='Up to 70% off'
            />
          </div>

          <ImageUploadField
            label='Banner Image'
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder='banners'
          />

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Link Type</Label>
              <Select
                value={form.link_type}
                onValueChange={(v) => setForm({ ...form, link_type: v as typeof form.link_type })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='category'>Category</SelectItem>
                  <SelectItem value='product'>Product</SelectItem>
                  <SelectItem value='store'>Store</SelectItem>
                  <SelectItem value='url'>URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Link Value</Label>
              <Input
                required
                value={form.link_value}
                onChange={(e) => setForm({ ...form, link_value: e.target.value })}
                placeholder='flash-deals'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label>Starts At</Label>
              <Input
                type='date'
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label>Ends At</Label>
              <Input
                type='date'
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Switch
              id='is_active'
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <Label htmlFor='is_active'>Active</Label>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !form.image}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit ? 'Save Changes' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
