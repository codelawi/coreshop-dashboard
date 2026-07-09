import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Store,
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react'
import {
  useAdminStore,
  useAdminStoreOrders,
  useAdminStoreProducts,
  useAdminCreateStoreProduct,
  useUpdateStoreStatus,
} from '@/hooks/api/use-stores'
import { useAdminCategories } from '@/hooks/api/use-categories-admin'
import { usePaymentSettings } from '@/hooks/api/use-settings'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number({ error: 'Required' }).min(0),
  original_price: z.number().optional(),
  stock: z.number({ error: 'Required' }).int().min(0),
})

type CreateProductForm = z.infer<typeof createProductSchema>

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  ready_for_pickup: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

const PRODUCT_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  flagged: 'bg-red-100 text-red-700',
  removed: 'bg-gray-100 text-gray-600',
}

function formatCurrency(v: number | string) {
  return `JOD ${Number(v ?? 0).toFixed(2)}`
}

export function StoreDetail() {
  const { storeId } = useParams({ from: '/_authenticated/stores/$storeId/' })
  const id = Number(storeId)
  const [showCreateProduct, setShowCreateProduct] = useState(false)

  const { data: storeData, isLoading } = useAdminStore(id)
  const { data: ordersData, isLoading: ordersLoading } = useAdminStoreOrders(id)
  const { data: productsData, isLoading: productsLoading } = useAdminStoreProducts(id)
  const { data: categoriesData } = useAdminCategories()
  const { data: paymentSettings } = usePaymentSettings()
  const updateStatus = useUpdateStoreStatus()
  const createProduct = useAdminCreateStoreProduct()

  const store = storeData?.data
  const orders = ordersData?.data ?? []
  const products = productsData?.data ?? []
  const categories = categoriesData?.data ?? []
  const platformFeePercent = paymentSettings?.platform_fee_percentage ?? 10

  const createForm = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', description: '', category_id: '', stock: 0 },
  })

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success('Store status updated.'),
        onError: () => toast.error('Failed to update store status.'),
      }
    )
  }

  function handleCreateProduct(values: CreateProductForm) {
    createProduct.mutate(
      {
        storeId: id,
        ...values,
        category_id: parseInt(values.category_id),
      },
      {
        onSuccess: () => {
          toast.success('Product created and approved.')
          setShowCreateProduct(false)
          createForm.reset()
        },
        onError: () => toast.error('Failed to create product.'),
      }
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (!store) {
    return (
      <Main>
        <p className='text-muted-foreground'>Store not found.</p>
      </Main>
    )
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' asChild>
            <Link to='/stores'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-lg font-semibold leading-none'>{store.name}</h1>
            <p className='text-xs text-muted-foreground'>{store.seller?.email}</p>
          </div>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='space-y-6'>
        {/* Store header card */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-wrap items-start gap-4'>
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className='h-16 w-16 rounded-lg object-cover'
                />
              ) : (
                <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-muted'>
                  <Store className='h-8 w-8 text-muted-foreground' />
                </div>
              )}

              <div className='flex-1 space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='text-xl font-bold'>{store.name}</h2>
                  <Badge
                    variant='outline'
                    className={`capitalize ${STATUS_COLORS[store.status] ?? ''}`}
                  >
                    {store.status}
                  </Badge>
                  {store.is_open ? (
                    <Badge
                      variant='outline'
                      className='border-green-200 bg-green-50 text-green-700'
                    >
                      <CheckCircle2 className='me-1 h-3 w-3' /> Open
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-red-200 bg-red-50 text-red-600'
                    >
                      <XCircle className='me-1 h-3 w-3' /> Closed
                    </Badge>
                  )}
                </div>
                {store.description && (
                  <p className='text-sm text-muted-foreground'>{store.description}</p>
                )}
                <div className='flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground'>
                  {store.city && (
                    <span className='flex items-center gap-1'>
                      <MapPin className='h-3.5 w-3.5' />
                      {store.city}
                    </span>
                  )}
                  {store.phone && (
                    <span className='flex items-center gap-1'>
                      <Phone className='h-3.5 w-3.5' />
                      {store.phone}
                    </span>
                  )}
                  {store.rating && (
                    <span className='flex items-center gap-1'>
                      <Star className='h-3.5 w-3.5 fill-yellow-400 text-yellow-400' />
                      {Number(store.rating).toFixed(1)} ({store.reviews_count} reviews)
                    </span>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Select
                  defaultValue={store.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className='w-36'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='suspended'>Suspended</SelectItem>
                    <SelectItem value='closed'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI row */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            {
              label: 'Total Revenue',
              value: formatCurrency(store.total_revenue),
              icon: DollarSign,
            },
            { label: 'Total Orders', value: store.orders_count, icon: ShoppingCart },
            { label: 'Products', value: store.products_count, icon: Package },
            { label: 'Sales', value: store.sales_count, icon: Star },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{kpi.label}</CardTitle>
                <kpi.icon className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue='orders'>
          <TabsList>
            <TabsTrigger value='orders'>Orders</TabsTrigger>
            <TabsTrigger value='products'>Products</TabsTrigger>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger value='payments'>Payments</TabsTrigger>
          </TabsList>

          {/* Orders tab */}
          <TabsContent value='orders'>
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                {ordersLoading ? (
                  <div className='flex h-40 items-center justify-center'>
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  </div>
                ) : orders.length === 0 ? (
                  <p className='p-6 text-center text-sm text-muted-foreground'>No orders yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className='font-mono text-sm'>#{order.id}</TableCell>
                          <TableCell>{order.client?.name ?? '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant='secondary'
                              className={`capitalize ${ORDER_STATUS_COLORS[order.status] ?? ''}`}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell className='text-muted-foreground'>
                            {order.created_at}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products tab */}
          <TabsContent value='products'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle>Products</CardTitle>
                <Button size='sm' onClick={() => setShowCreateProduct(true)}>
                  <Plus className='me-1.5 h-3.5 w-3.5' />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent className='p-0'>
                {productsLoading ? (
                  <div className='flex h-40 items-center justify-center'>
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  </div>
                ) : products.length === 0 ? (
                  <p className='p-6 text-center text-sm text-muted-foreground'>No products yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {product.images?.[0]?.url && (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className='h-8 w-8 rounded object-cover'
                                />
                              )}
                              <span className='font-medium'>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {product.category?.name ?? '—'}
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge
                              variant='secondary'
                              className={`capitalize ${PRODUCT_STATUS_COLORS[product.status] ?? ''}`}
                            >
                              {product.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details tab */}
          <TabsContent value='details'>
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className='grid gap-3 sm:grid-cols-2'>
                  {[
                    { label: 'Store Name', value: store.name },
                    { label: 'Seller', value: store.seller?.name },
                    { label: 'Email', value: store.seller?.email },
                    { label: 'Phone', value: store.phone ?? '—' },
                    { label: 'City', value: store.city ?? '—' },
                    { label: 'Address', value: store.address ?? '—' },
                    {
                      label: 'Delivery Radius',
                      value: store.delivery_radius_km ? `${store.delivery_radius_km} km` : '—',
                    },
                    { label: 'Member Since', value: store.created_at },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
                      <dd className='mt-0.5 text-sm'>{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments tab */}
          <TabsContent value='payments'>
            <div className='space-y-4'>
              {/* Earnings summary */}
              <div className='grid gap-4 sm:grid-cols-3'>
                {(() => {
                  const gross = Number(store.total_revenue ?? 0)
                  const fee = Math.round(gross * (platformFeePercent / 100) * 100) / 100
                  const net = Math.round((gross - fee) * 100) / 100
                  return [
                    { label: 'Gross Revenue', value: formatCurrency(gross), color: '' },
                    { label: `Platform Fee (${platformFeePercent}%)`, value: `−${formatCurrency(fee)}`, color: 'text-destructive' },
                    { label: 'Net Earnings', value: formatCurrency(net), color: 'text-green-600' },
                  ].map((item) => (
                    <Card key={item.label}>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>{item.label}</CardTitle>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                      </CardContent>
                    </Card>
                  ))
                })()}
              </div>

              {/* Completed orders with payment info */}
              <Card>
                <CardHeader>
                  <CardTitle>Completed Orders</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  {(() => {
                    const completed = orders.filter((o: any) =>
                      ['delivered', 'completed'].includes(o.status)
                    )
                    if (completed.length === 0) {
                      return (
                        <p className='p-6 text-center text-sm text-muted-foreground'>
                          No completed orders yet.
                        </p>
                      )
                    }
                    return (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Gross</TableHead>
                            <TableHead>Fee ({platformFeePercent}%)</TableHead>
                            <TableHead>Net</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completed.map((order: any) => {
                            const gross = Number(order.total ?? 0)
                            const deliveryFee = Number(order.delivery_fee ?? 0)
                            const sellerGross = gross - deliveryFee
                            const fee = Math.round(sellerGross * (platformFeePercent / 100) * 100) / 100
                            const net = Math.round((sellerGross - fee) * 100) / 100
                            return (
                              <TableRow key={order.id}>
                                <TableCell className='font-mono text-sm'>#{order.id}</TableCell>
                                <TableCell>{order.client?.name ?? '—'}</TableCell>
                                <TableCell>{formatCurrency(sellerGross)}</TableCell>
                                <TableCell className='text-destructive'>−{formatCurrency(fee)}</TableCell>
                                <TableCell className='font-semibold text-green-600'>{formatCurrency(net)}</TableCell>
                                <TableCell className='text-muted-foreground'>{order.created_at}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add Product to {store?.name}</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateProduct)}
              className='space-y-4'
            >
              <FormField
                control={createForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Classic White T-Shirt' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Product description...'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='category_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
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

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={createForm.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (JOD)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          placeholder='0.00'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name='original_price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          placeholder='0.00'
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name='stock'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        placeholder='0'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowCreateProduct(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={createProduct.isPending}>
                  {createProduct.isPending && (
                    <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  )}
                  Create Product
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
