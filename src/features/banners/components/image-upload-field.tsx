import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminUpload } from '@/hooks/api/use-admin-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: 'banners' | 'categories'
}

export function ImageUploadField({ label, value, onChange, folder = 'banners' }: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useAdminUpload()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    upload.mutate(
      { file, folder },
      {
        onSuccess: (data) => {
          onChange(data.data.url)
          toast.success('Image uploaded.')
        },
        onError: () => toast.error('Upload failed.'),
      }
    )
    e.target.value = ''
  }

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='flex gap-2'>
        <Button
          type='button'
          size='sm'
          variant={mode === 'url' ? 'default' : 'outline'}
          onClick={() => setMode('url')}
        >
          <LinkIcon className='mr-1 h-3.5 w-3.5' />
          URL
        </Button>
        <Button
          type='button'
          size='sm'
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => setMode('upload')}
        >
          <Upload className='mr-1 h-3.5 w-3.5' />
          Upload
        </Button>
      </div>

      {mode === 'url' ? (
        <Input
          placeholder='https://example.com/image.jpg'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className='flex items-center gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileChange}
          />
          <Button
            type='button'
            variant='outline'
            className='w-full'
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Upload className='mr-2 h-4 w-4' />
            )}
            {upload.isPending ? 'Uploading…' : 'Choose file'}
          </Button>
        </div>
      )}

      {value && (
        <div className='relative overflow-hidden rounded-md border'>
          <img src={value} alt='Preview' className='h-32 w-full object-cover' />
          <button
            type='button'
            className='absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80'
            onClick={() => onChange('')}
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
      )}
    </div>
  )
}
