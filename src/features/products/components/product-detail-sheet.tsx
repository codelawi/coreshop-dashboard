import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Package,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminProduct, useUpdateProductStatus } from '@/hooks/api/use-products'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UserProfileSheet } from '@/features/users/components/user-profile-sheet'

interface ProductDetailSheetProps {
  productId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCurrency(v: number | string) {
  return `JOD ${Number(v ?? 0).toFixed(2)}`
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  flagged: 'bg-orange-100 text-orange-700',
  removed: 'bg-gray-100 text-gray-600',
}

export function ProductDetailSheet({
  productId,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const { data, isLoading } = useAdminProduct(open ? productId : 0)
  const updateStatus = useUpdateProductStatus()
  const [removeConfirm, setRemoveConfirm] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [sellerOpen, setSellerOpen] = useState(false)
  const product = data?.data

  const handleStatusChange = (status: string, successMsg: string) => {
    updateStatus.mutate(
      { id: productId, status },
      {
        onSuccess: () => toast.success(successMsg),
        onError: () => toast.error('Failed to update status.'),
      }
    )
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v)
          setActiveImg(0)
        }}
      >
        <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
          <SheetHeader>
            <SheetTitle>Product #{productId}</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className='flex h-64 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : !product ? (
            <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Package className='h-8 w-8 opacity-30' />
              <p className='text-sm'>Product not found.</p>
            </div>
          ) : (
            <div className='mt-4 space-y-6 px-4 pb-6'>
              {/* Status + actions row */}
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <Badge
                  variant='secondary'
                  className={`capitalize ${STATUS_COLORS[product.status] ?? ''}`}
                >
                  {product.status.replace(/_/g, ' ')}
                </Badge>
                <div className='flex flex-wrap gap-2'>
                  {product.status !== 'approved' && (
                    <Button
                      size='sm'
                      className='bg-green-600 hover:bg-green-700 text-white'
                      onClick={() => handleStatusChange('approved', 'Product approved.')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className='me-1.5 h-3.5 w-3.5' />
                      Approve
                    </Button>
                  )}
                  {product.status !== 'flagged' && product.status !== 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                      onClick={() => handleStatusChange('flagged', 'Product flagged.')}
                      disabled={updateStatus.isPending}
                    >
                      <AlertTriangle className='me-1.5 h-3.5 w-3.5' />
                      Flag
                    </Button>
                  )}
                  {product.status !== 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='border-destructive/30 text-destructive hover:bg-destructive/10'
                      onClick={() => setRemoveConfirm(true)}
                      disabled={updateStatus.isPending}
                    >
                      <Trash2 className='me-1.5 h-3.5 w-3.5' />
                      Remove
                    </Button>
                  )}
                  {product.status === 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleStatusChange('pending_review', 'Product restored to review.')}
                      disabled={updateStatus.isPending}
                    >
                      Restore to Review
                    </Button>
                  )}
                </div>
              </div>

              {/* Images */}
              {product.images?.length > 0 ? (
                <div className='space-y-2'>
                  <div className='relative aspect-video w-full overflow-hidden rounded-xl bg-muted'>
                    <img
                      src={product.images[activeImg]?.url ?? product.images[0]?.url}
                      alt={product.name}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className='flex gap-2 overflow-x-auto pb-1'>
                      {product.images.map((img: any, i: number) => (
                        <button
                          key={img.id ?? i}
                          onClick={() => setActiveImg(i)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            activeImg === i ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img src={img.url} alt='' className='h-full w-full object-cover' />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex aspect-video w-full items-center justify-center rounded-xl bg-muted'>
                  <Package className='h-12 w-12 text-muted-foreground/30' />
                </div>
              )}

              {/* Name + slug */}
              <div>
                <h2 className='text-xl font-bold'>{product.name}</h2>
                <p className='text-sm text-muted-foreground'>{product.slug}</p>
              </div>

              {/* Price / stock / weight grid */}
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {[
                  { label: 'Price', value: formatCurrency(product.price) },
                  { label: 'Original', value: product.original_price ? formatCurrency(product.original_price) : '—' },
                  { label: 'Stock', value: String(product.stock) },
                  { label: 'Weight', value: product.weight_grams ? `${product.weight_grams} g` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className='rounded-lg border p-3'>
                    <p className='text-xs text-muted-foreground'>{label}</p>
                    <p className='mt-0.5 font-semibold'>{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <p className='mb-1 text-sm font-medium'>Description</p>
                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {product.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* People & Store */}
              <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                <div>
                  <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Category
                  </p>
                  <p className='font-medium'>{product.category?.name ?? '—'}</p>
                </div>

                {product.store && (
                  <div>
                    <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Store
                    </p>
                    <Link
                      to='/stores/$storeId'
                      params={{ storeId: String(product.store.id) }}
                      className='inline-flex items-center gap-1 font-medium hover:underline'
                    >
                      {product.store.name}
                      <ExternalLink className='h-3 w-3 text-muted-foreground' />
                    </Link>
                  </div>
                )}

                {product.seller && (
                  <div>
                    <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Seller
                    </p>
                    <button
                      onClick={() => setSellerOpen(true)}
                      className='text-left hover:underline'
                    >
                      <p className='font-medium'>{product.seller.name}</p>
                      <p className='text-xs text-muted-foreground'>{product.seller.email}</p>
                    </button>
                  </div>
                )}

                <div>
                  <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Performance
                  </p>
                  <p className='font-medium'>
                    {product.sales_count ?? 0} sales · {product.views_count ?? 0} views
                  </p>
                </div>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className='mb-3 font-medium'>Variants ({product.variants.length})</p>
                    <div className='space-y-2'>
                      {product.variants.map((v: any) => (
                        <div
                          key={v.id}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex items-center gap-3'>
                            {v.color_hex && (
                              <div
                                className='h-5 w-5 rounded-full border'
                                style={{ backgroundColor: v.color_hex }}
                              />
                            )}
                            <div>
                              <p className='text-sm font-medium'>
                                {[v.size, v.color].filter(Boolean).join(' · ') || `Variant #${v.id}`}
                              </p>
                              {v.sku && (
                                <p className='font-mono text-xs text-muted-foreground'>SKU: {v.sku}</p>
                              )}
                            </div>
                          </div>
                          <div className='text-right text-sm'>
                            <p className='font-medium'>Stock: {v.stock}</p>
                            {v.price_adjustment !== 0 && (
                              <p className='text-xs text-muted-foreground'>
                                {v.price_adjustment > 0 ? '+' : ''}
                                {formatCurrency(v.price_adjustment)}
                              </p>
                            )}
                            <Badge variant={v.is_active ? 'default' : 'secondary'} className='mt-1 text-xs'>
                              {v.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Dates */}
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-xs text-muted-foreground'>Created</p>
                  <p className='font-medium'>{product.created_at}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Rating</p>
                  <p className='font-medium'>
                    {product.rating ? `${Number(product.rating).toFixed(1)} ★` : '—'}
                    {product.reviews_count ? ` (${product.reviews_count})` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {product?.seller && (
        <UserProfileSheet
          userId={product.seller.id}
          open={sellerOpen}
          onOpenChange={setSellerOpen}
        />
      )}

      <AlertDialog open={removeConfirm} onOpenChange={setRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide <strong>{product?.name}</strong> from the platform.
              You can restore it later by changing the status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={() => {
                handleStatusChange('removed', 'Product removed.')
                setRemoveConfirm(false)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
