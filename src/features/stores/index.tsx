import { useRef, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
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
  Trash2,
  ImageIcon,
  X,
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
import { useAdminUpload } from '@/hooks/api/use-admin-upload'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  color_hex: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  price_adjustment: z.number().default(0),
})

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number({ error: 'Required' }).min(0),
  original_price: z.number().optional(),
  stock: z.number({ error: 'Required' }).int().min(0),
  images: z.array(z.string()).optional(),
  variants: z.array(variantSchema).optional(),
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
  const [uploadingImg, setUploadingImg] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const { data: storeData, isLoading } = useAdminStore(id)
  const { data: ordersData, isLoading: ordersLoading } = useAdminStoreOrders(id)
  const { data: productsData, isLoading: productsLoading } = useAdminStoreProducts(id)
  const { data: categoriesData } = useAdminCategories()
  const { data: paymentSettings } = usePaymentSettings()
  const updateStatus = useUpdateStoreStatus()
  const createProduct = useAdminCreateStoreProduct()
  const upload = useAdminUpload()

  const store = storeData?.data
  const orders = ordersData?.data ?? []
  const products = productsData?.data ?? []
  const categories = categoriesData?.data ?? []
  const platformFeePercent = paymentSettings?.platform_fee_percentage ?? 10

  const createForm = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      stock: 0,
      images: [],
      variants: [],
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({ control: createForm.control, name: 'variants' })

  const watchedImages = createForm.watch('images') ?? []

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    upload.mutate(
      { file, folder: 'banners' },
      {
        onSuccess: (data) => {
          const current = createForm.getValues('images') ?? []
          createForm.setValue('images', [...current, data.data.url])
        },
        onError: () => toast.error('Image upload failed.'),
        onSettled: () => {
          setUploadingImg(false)
          e.target.value = ''
        },
      }
    )
  }

  const removeImage = (index: number) => {
    const current = createForm.getValues('images') ?? []
    createForm.setValue('images', current.filter((_, i) => i !== index))
  }

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
                            <div className='flex items-center gap-3'>
                              <div className='h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border'>
                                {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className='h-full w-full object-cover'
                                  />
                                ) : (
                                  <div className='flex h-full w-full items-center justify-center'>
                                    <Package className='h-5 w-5 text-muted-foreground/40' />
                                  </div>
                                )}
                              </div>
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

      <Dialog
        open={showCreateProduct}
        onOpenChange={(v) => {
          setShowCreateProduct(v)
          if (!v) createForm.reset()
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add Product to {store?.name}</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateProduct)}
              className='space-y-5'
            >
              {/* Basic info */}
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

              {/* Pricing + stock */}
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
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
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          placeholder='0.00'
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Photos */}
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Photos</p>
                <div className='flex flex-wrap gap-2'>
                  {watchedImages.map((url, i) => (
                    <div
                      key={i}
                      className='relative h-20 w-20 overflow-hidden rounded-lg border bg-muted'
                    >
                      <img
                        src={url}
                        alt=''
                        className='h-full w-full object-cover'
                      />
                      {i === 0 && (
                        <span className='absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[10px] text-white'>
                          Primary
                        </span>
                      )}
                      <button
                        type='button'
                        onClick={() => removeImage(i)}
                        className='absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}

                  {watchedImages.length < 5 && (
                    <button
                      type='button'
                      onClick={() => imgInputRef.current?.click()}
                      disabled={uploadingImg}
                      className='flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50'
                    >
                      {uploadingImg ? (
                        <Loader2 className='h-5 w-5 animate-spin' />
                      ) : (
                        <>
                          <ImageIcon className='h-5 w-5' />
                          <span className='text-[10px]'>Add photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={imgInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImgUpload}
                />
                <p className='text-xs text-muted-foreground'>
                  First photo is the primary image. Up to 5 photos.
                </p>
              </div>

              <Separator />

              {/* Variants */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>Variants</p>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='h-7 text-xs'
                    onClick={() =>
                      appendVariant({
                        size: '',
                        color: '',
                        color_hex: '',
                        stock: 0,
                        price_adjustment: 0,
                      })
                    }
                  >
                    <Plus className='me-1 h-3.5 w-3.5' />
                    Add variant
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    No variants. Add a variant to offer different sizes, colors,
                    etc.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {variantFields.map((vf, i) => (
                      <div
                        key={vf.id}
                        className='relative rounded-lg border p-3'
                      >
                        <button
                          type='button'
                          onClick={() => removeVariant(i)}
                          className='absolute right-2 top-2 text-muted-foreground hover:text-destructive'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </button>
                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                          <FormField
                            control={createForm.control}
                            name={`variants.${i}.size`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Size</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='S, M, L, XL…'
                                    className='h-8 text-sm'
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name={`variants.${i}.color`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Color</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Red, Blue…'
                                    className='h-8 text-sm'
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name={`variants.${i}.color_hex`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>
                                  Color Hex
                                </FormLabel>
                                <div className='flex items-center gap-1.5'>
                                  <input
                                    type='color'
                                    value={field.value ?? '#000000'}
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                    className='h-8 w-8 cursor-pointer rounded border p-0.5'
                                  />
                                  <FormControl>
                                    <Input
                                      placeholder='#ffffff'
                                      className='h-8 text-sm'
                                      {...field}
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name={`variants.${i}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>Stock</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    min='0'
                                    className='h-8 text-sm'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name={`variants.${i}.price_adjustment`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-xs'>
                                  Price +/− (JOD)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    className='h-8 text-sm'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowCreateProduct(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createProduct.isPending || uploadingImg}
                >
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
