import { useState } from 'react'
import { ImageIcon, Loader2, Pencil } from 'lucide-react'
import { useAdminCategories } from '@/hooks/api/use-categories-admin'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import type { Category } from './data/schema'
import { CategoryImageDialog } from './components/category-image-dialog'

function CategoryCard({ category, onEdit }: { category: Category; onEdit: (cat: Category) => void }) {
  return (
    <div className='group relative overflow-hidden rounded-lg border bg-card shadow-sm'>
      <div className='relative h-32 w-full bg-muted'>
        {category.image ? (
          <img src={category.image} alt={category.name} className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <ImageIcon className='h-8 w-8 text-muted-foreground/40' />
          </div>
        )}
        <button
          onClick={() => onEdit(category)}
          className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'
        >
          <Pencil className='h-5 w-5 text-white' />
        </button>
      </div>
      <div className='flex items-center justify-between p-3'>
        <div>
          <p className='font-medium leading-tight'>{category.name}</p>
          <p className='text-xs text-muted-foreground'>{category.slug}</p>
        </div>
        <Badge variant={category.is_active ? 'default' : 'secondary'} className='text-xs'>
          {category.is_active ? 'Active' : 'Off'}
        </Badge>
      </div>
    </div>
  )
}

export function Categories() {
  const { data, isLoading } = useAdminCategories()
  const categories: Category[] = data?.data ?? []
  const [selected, setSelected] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (cat: Category) => {
    setSelected(cat)
    setDialogOpen(true)
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
      </Header>

      <Main className='flex flex-1 flex-col gap-6 sm:gap-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
          <p className='text-muted-foreground'>
            Edit category images shown in the mobile app.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='space-y-8'>
            {categories.map((parent) => (
              <div key={parent.id}>
                <div className='mb-3 flex items-center gap-2'>
                  <h3 className='text-lg font-semibold'>{parent.name}</h3>
                  <span className='text-xs text-muted-foreground'>({parent.children?.length ?? 0} subcategories)</span>
                </div>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                  <CategoryCard category={parent} onEdit={handleEdit} />
                  {parent.children?.map((child) => (
                    <CategoryCard key={(child as Category).id} category={child as Category} onEdit={handleEdit} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Main>

      <CategoryImageDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setTimeout(() => setSelected(null), 200) }}
        category={selected}
      />
    </>
  )
}
