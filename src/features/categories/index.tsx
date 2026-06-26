import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/api/use-categories-admin'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Category } from './data/schema'
import { ImageUploadField } from '../banners/components/image-upload-field'

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().optional(),
  is_active: z.boolean(),
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parent_id: z.string().optional(),
  is_active: z.boolean(),
})

type EditForm = z.infer<typeof editSchema>
type CreateForm = z.infer<typeof createSchema>

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
}) {
  return (
    <div className='group relative overflow-hidden rounded-lg border bg-card shadow-sm'>
      <div className='relative h-32 w-full bg-muted'>
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <ImageIcon className='h-8 w-8 text-muted-foreground/40' />
          </div>
        )}
        <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            onClick={() => onEdit(category)}
            className='flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-white'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={() => onDelete(category)}
            className='flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-500'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
      <div className='flex items-center justify-between p-3'>
        <div>
          <p className='font-medium leading-tight'>{category.name}</p>
          <p className='text-xs text-muted-foreground'>{category.slug}</p>
        </div>
        <Badge
          variant={category.is_active ? 'default' : 'secondary'}
          className='text-xs'
        >
          {category.is_active ? 'Active' : 'Off'}
        </Badge>
      </div>
    </div>
  )
}

export function Categories() {
  const { data, isLoading } = useAdminCategories()
  const categories: Category[] = data?.data ?? []
  const updateCategory = useUpdateCategory()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', image: '', is_active: true },
  })

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', parent_id: 'none', is_active: true },
  })

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    editForm.reset({
      name: cat.name,
      image: cat.image ?? '',
      is_active: Boolean(cat.is_active),
    })
  }

  const handleEdit = (values: EditForm) => {
    if (!editTarget) return
    updateCategory.mutate(
      { id: editTarget.id, ...values },
      {
        onSuccess: () => {
          toast.success('Category updated.')
          setEditTarget(null)
        },
        onError: () => toast.error('Failed to update category.'),
      }
    )
  }

  const handleCreate = (values: CreateForm) => {
    createCategory.mutate(
      {
        name: values.name,
        parent_id: values.parent_id && values.parent_id !== 'none' ? parseInt(values.parent_id) : undefined,
        is_active: values.is_active,
      },
      {
        onSuccess: () => {
          toast.success('Category created.')
          setCreateOpen(false)
          createForm.reset()
        },
        onError: () => toast.error('Failed to create category.'),
      }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`"${deleteTarget.name}" deleted.`)
        setDeleteTarget(null)
      },
      onError: () => toast.error('Failed to delete category.'),
    })
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <Button size='sm' onClick={() => setCreateOpen(true)}>
            <Plus className='me-1.5 h-3.5 w-3.5' />
            New Category
          </Button>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6 sm:gap-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
          <p className='text-muted-foreground'>
            Manage all product categories.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-75 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='space-y-8'>
            {categories.map((parent) => (
              <div key={parent.id}>
                <div className='mb-3 flex items-center gap-2'>
                  <h3 className='text-lg font-semibold'>{parent.name}</h3>
                  <span className='text-xs text-muted-foreground'>
                    ({parent.children?.length ?? 0} subcategories)
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                  <CategoryCard
                    category={parent}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                  {parent.children?.map((child) => (
                    <CategoryCard
                      key={(child as Category).id}
                      category={child as Category}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Main>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEdit)}
              className='space-y-4'
            >
              <FormField
                control={editForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <ImageUploadField
                      label='Category Image'
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      folder='categories'
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <FormLabel className='cursor-pointer'>Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditTarget(null)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={updateCategory.isPending}>
                  {updateCategory.isPending && (
                    <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  )}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreate)}
              className='space-y-4'
            >
              <FormField
                control={createForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Electronics' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='parent_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category (optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Top-level category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>Top-level category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <FormLabel className='cursor-pointer'>Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={createCategory.isPending}>
                  {createCategory.isPending && (
                    <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>{' '}
              and cannot be undone. Products in this category may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending && (
                <Loader2 className='me-2 h-4 w-4 animate-spin' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
