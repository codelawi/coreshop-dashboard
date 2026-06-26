import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Star,
  Store,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminStores, useAdminCreateStore } from '@/hooks/api/use-stores'
import { useUsers } from '@/hooks/api/use-users'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const createStoreSchema = z.object({
  seller_id: z.string().min(1, 'Seller is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
})

type CreateStoreForm = z.infer<typeof createStoreSchema>

export function Stores() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useAdminStores({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    per_page: 50,
  })

  const { data: usersData } = useUsers({ role: 'seller', per_page: 100 })

  const createStore = useAdminCreateStore()

  const stores = data?.data ?? []

  const form = useForm<CreateStoreForm>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      seller_id: '',
      name: '',
      description: '',
      phone: '',
      city: '',
      address: '',
    },
  })

  const handleCreate = (values: CreateStoreForm) => {
    createStore.mutate(
      {
        seller_id: parseInt(values.seller_id),
        name: values.name,
        description: values.description || undefined,
        phone: values.phone || undefined,
        city: values.city || undefined,
        address: values.address || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Store created.')
          setCreateOpen(false)
          form.reset()
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to create store.')
        },
      }
    )
  }

  return (
    <>
      <Header fixed>
        <div className='flex flex-1 items-center gap-2'>
          <div className='relative w-64'>
            <Search className='absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search stores...'
              className='ps-8'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='suspended'>Suspended</SelectItem>
              <SelectItem value='closed'>Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <Button size='sm' onClick={() => setCreateOpen(true)}>
            <Plus className='me-1.5 h-3.5 w-3.5' />
            New Store
          </Button>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Stores</h2>
          <p className='text-muted-foreground'>
            Manage all seller stores on the platform.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : stores.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <Store className='h-10 w-10 opacity-30' />
            <p className='text-sm'>No stores found.</p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8 rounded-lg'>
                          <AvatarImage
                            src={store.logo ?? undefined}
                            alt={store.name}
                          />
                          <AvatarFallback className='rounded-lg text-xs'>
                            {store.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium leading-none'>{store.name}</p>
                          {store.city && (
                            <p className='mt-0.5 text-xs text-muted-foreground'>
                              {store.city}
                            </p>
                          )}
                        </div>
                        {store.is_open ? (
                          <CheckCircle2 className='h-3.5 w-3.5 text-green-500' />
                        ) : (
                          <XCircle className='h-3.5 w-3.5 text-muted-foreground' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='text-sm font-medium'>
                          {store.seller?.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {store.seller?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={`capitalize ${STATUS_COLORS[store.status] ?? ''}`}
                      >
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {store.products_count}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {store.orders_count}
                    </TableCell>
                    <TableCell>
                      {store.rating ? (
                        <span className='flex items-center gap-1 text-sm'>
                          <Star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400' />
                          {Number(store.rating).toFixed(1)}
                        </span>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {store.created_at}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 gap-1.5 text-xs'
                        asChild
                      >
                        <Link
                          to='/stores/$storeId'
                          params={{ storeId: String(store.id) }}
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                          Manage
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='seller_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a seller' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(usersData?.data ?? [])
                          .filter((u: any) => u.role === 'seller')
                          .map((user: any) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.name} — {user.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Ahmed Fashion' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Brief store description...'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Amman' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='+962 7...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Street address...' {...field} />
                    </FormControl>
                    <FormMessage />
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
                <Button type='submit' disabled={createStore.isPending}>
                  {createStore.isPending && (
                    <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  )}
                  Create Store
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
