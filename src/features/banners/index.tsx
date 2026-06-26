import { GripVertical, Loader2, Plus } from 'lucide-react'
import { useBanners } from '@/hooks/api/use-banners'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Banner } from './data/schema'
import { BannersProvider, useBannersContext } from './components/banners-provider'
import { BannersDialogs } from './components/banners-dialogs'
import { BannersRowActions } from './components/banners-row-actions'

function BannersContent() {
  const { data, isLoading } = useBanners()
  const banners: Banner[] = data?.data ?? []
  const { setOpen } = useBannersContext()

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Banners</h2>
            <p className='text-muted-foreground'>
              Manage homepage promotional banners.
            </p>
          </div>
          <Button onClick={() => setOpen('create')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Banner
          </Button>
        </div>

        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='space-y-3'>
            {banners.length === 0 && (
              <div className='flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
                No banners yet. Click "Add Banner" to create one.
              </div>
            )}
            {banners.map((banner) => (
              <div
                key={banner.id}
                className='flex items-center gap-4 rounded-lg border bg-card p-3 shadow-sm'
              >
                <GripVertical className='h-5 w-5 shrink-0 cursor-grab text-muted-foreground' />
                <div className='h-16 w-28 shrink-0 overflow-hidden rounded-md border'>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='truncate font-medium'>{banner.title}</p>
                    <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {banner.subtitle && (
                    <p className='mt-0.5 truncate text-sm text-muted-foreground'>{banner.subtitle}</p>
                  )}
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {banner.link_type} → <span className='font-mono'>{banner.link_value}</span>
                    {banner.starts_at && ` · from ${banner.starts_at.slice(0, 10)}`}
                    {banner.ends_at && ` to ${banner.ends_at.slice(0, 10)}`}
                  </p>
                </div>
                <BannersRowActions banner={banner} />
              </div>
            ))}
          </div>
        )}
      </Main>

      <BannersDialogs />
    </>
  )
}

export function Banners() {
  return (
    <BannersProvider>
      <BannersContent />
    </BannersProvider>
  )
}
