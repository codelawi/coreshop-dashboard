import { Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminProduct, useUpdateProductStatus } from '@/hooks/api/use-products'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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
  const product = data?.data

  const handleApprove = () => {
    updateStatus.mutate(
      { id: productId, status: 'approved' },
      {
        onSuccess: () => toast.success('Product approved.'),
        onError: () => toast.error('Failed to approve product.'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Product Details</SheetTitle>
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
            {/* Images */}
            {product.images?.length > 0 && (
              <div className='flex gap-2 overflow-x-auto pb-1'>
                {product.images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={product.name}
                    className={`h-24 w-24 flex-shrink-0 rounded-lg object-cover ring-2 ${img.is_primary ? 'ring-primary' : 'ring-transparent'}`}
                  />
                ))}
              </div>
            )}

            {/* Header info */}
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold'>{product.name}</h2>
                <p className='text-sm text-muted-foreground'>{product.slug}</p>
              </div>
              <Badge
                variant='secondary'
                className={`capitalize ${STATUS_COLORS[product.status] ?? ''}`}
              >
                {product.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Pricing & Stock */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              {[
                { label: 'Price', value: formatCurrency(product.price) },
                {
                  label: 'Original Price',
                  value: product.original_price
                    ? formatCurrency(product.original_price)
                    : '—',
                },
                { label: 'Stock', value: product.stock },
                {
                  label: 'Weight',
                  value: product.weight_grams
                    ? `${product.weight_grams} g`
                    : '—',
                },
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

            {/* Meta */}
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-xs text-muted-foreground'>Category</p>
                <p className='font-medium'>{product.category?.name ?? '—'}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Store</p>
                <p className='font-medium'>{product.store?.name ?? '—'}</p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Seller</p>
                <p className='font-medium'>{product.seller?.name ?? '—'}</p>
                <p className='text-xs text-muted-foreground'>
                  {product.seller?.email}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Stats</p>
                <p className='font-medium'>
                  {product.sales_count ?? 0} sales · {product.views_count ?? 0}{' '}
                  views
                </p>
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className='mb-3 font-medium'>
                    Variants ({product.variants.length})
                  </p>
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
                              {[v.size, v.color].filter(Boolean).join(' · ') ||
                                `Variant #${v.id}`}
                            </p>
                            {v.description && (
                              <p className='text-xs text-muted-foreground'>
                                {v.description}
                              </p>
                            )}
                            {v.sku && (
                              <p className='font-mono text-xs text-muted-foreground'>
                                SKU: {v.sku}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='text-right text-sm'>
                          <p className='font-medium'>
                            Stock: {v.stock}
                          </p>
                          {v.price_adjustment !== 0 && (
                            <p className='text-xs text-muted-foreground'>
                              {v.price_adjustment > 0 ? '+' : ''}
                              {formatCurrency(v.price_adjustment)}
                            </p>
                          )}
                          <Badge
                            variant={v.is_active ? 'default' : 'secondary'}
                            className='mt-1 text-xs'
                          >
                            {v.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            {product.status === 'pending_review' && (
              <>
                <Separator />
                <Button
                  className='w-full bg-green-600 hover:bg-green-700'
                  onClick={handleApprove}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Approve Product
                </Button>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
