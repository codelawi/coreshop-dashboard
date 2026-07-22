import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Package,
  Printer,
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { UserProfileSheet } from '@/features/users/components/user-profile-sheet'

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; pill: string }> = {
  approved:       { label: 'Approved',       pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  pending_review: { label: 'Pending Review', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  flagged:        { label: 'Flagged',        pill: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
  removed:        { label: 'Removed',        pill: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

type Tab = 'description' | 'insights' | 'inventory'

const TABS: { id: Tab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'insights', label: 'Insights' },
  { id: 'inventory', label: 'Inventory' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | string | null | undefined) {
  return `JOD ${Number(v ?? 0).toFixed(2)}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, pill: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      {cfg.label}
    </span>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[180px_1fr] items-start border-b last:border-b-0'>
      <div className='px-4 py-3.5 text-sm text-muted-foreground'>{label}</div>
      <div className='border-l px-4 py-3.5 text-sm text-foreground'>{children}</div>
    </div>
  )
}

// ─── Description tab ─────────────────────────────────────────────────────────

function DescriptionTab({ product, onSellerClick }: { product: any; onSellerClick: () => void }) {
  return (
    <div className='overflow-hidden rounded-xl border'>
      {product.description && (
        <Row label='Description'>
          <span className='leading-relaxed text-muted-foreground'>{product.description}</span>
        </Row>
      )}
      {product.category && (
        <Row label='Category'>
          <span className='font-medium'>{product.category.name}</span>
        </Row>
      )}
      {product.variants?.length > 0 && (
        <Row label='Variants'>
          <span className='font-medium'>{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</span>
        </Row>
      )}
      <Row label='Sales Price (MSRP)'>
        <span className='font-semibold'>{fmt(product.price)}</span>
      </Row>
      {product.original_price && (
        <Row label='Original Price'>
          <span className='font-medium'>{fmt(product.original_price)}</span>
        </Row>
      )}
      <Row label='Stock'>
        <span className='font-medium'>{product.stock ?? 0} units</span>
      </Row>
      {product.weight_grams && (
        <Row label='Weight'>
          <span className='font-medium'>{product.weight_grams} g</span>
        </Row>
      )}
      {product.store && (
        <Row label='Store'>
          <Link
            to='/stores/$storeId'
            params={{ storeId: String(product.store.id) }}
            className='inline-flex items-center gap-1 font-medium hover:underline'
          >
            {product.store.name}
            <ExternalLink className='h-3 w-3 text-muted-foreground' />
          </Link>
        </Row>
      )}
      {product.seller && (
        <Row label='Seller'>
          <button onClick={onSellerClick} className='font-medium hover:underline'>
            {product.seller.name}
          </button>
          <p className='text-xs text-muted-foreground'>{product.seller.email}</p>
        </Row>
      )}
      <Row label='Listed'>
        <span className='text-muted-foreground'>{product.created_at}</span>
      </Row>
    </div>
  )
}

// ─── Insights tab ─────────────────────────────────────────────────────────────

function InsightsTab({ product }: { product: any }) {
  const stats = [
    { label: 'Total Sales', value: String(product.sales_count ?? 0), sub: 'orders placed' },
    { label: 'Total Views', value: String(product.views_count ?? 0), sub: 'product page views' },
    {
      label: 'Rating',
      value: product.rating ? `${Number(product.rating).toFixed(1)} ★` : '—',
      sub: `${product.reviews_count ?? 0} reviews`,
    },
    { label: 'In Stock', value: String(product.stock ?? 0), sub: 'units available' },
  ]

  return (
    <div className='grid grid-cols-2 gap-3'>
      {stats.map(({ label, value, sub }) => (
        <div key={label} className='rounded-xl border p-4'>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <p className='mt-1.5 text-2xl font-bold tracking-tight'>{value}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Inventory tab ───────────────────────────────────────────────────────────

function InventoryTab({ product }: { product: any }) {
  if (!product.variants?.length) {
    return (
      <div className='overflow-hidden rounded-xl border'>
        <Row label='Total Stock'>
          <span className='font-semibold'>{product.stock ?? 0} units</span>
        </Row>
        {product.weight_grams && (
          <Row label='Weight per unit'>
            <span className='font-semibold'>{product.weight_grams} g</span>
          </Row>
        )}
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border'>
      {/* Header row */}
      <div className='grid grid-cols-[1fr_80px_80px_80px] border-b bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
        <span>Variant</span>
        <span className='text-center'>Stock</span>
        <span className='text-center'>Adj.</span>
        <span className='text-right'>Status</span>
      </div>
      <div className='divide-y'>
        {product.variants.map((v: any, i: number) => (
          <div key={v.id} className='grid grid-cols-[1fr_80px_80px_80px] items-center px-4 py-3'>
            <div className='flex items-center gap-2 min-w-0'>
              {v.color_hex && (
                <div
                  className='h-4 w-4 shrink-0 rounded-full border shadow-sm'
                  style={{ backgroundColor: v.color_hex }}
                />
              )}
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium'>
                  {[v.size, v.color].filter(Boolean).join(' · ') || `Variant ${i + 1}`}
                </p>
                {v.sku && (
                  <p className='font-mono text-xs text-muted-foreground'>SKU: {v.sku}</p>
                )}
              </div>
            </div>
            <p className='text-center text-sm font-semibold'>{v.stock}</p>
            <p className='text-center text-xs text-muted-foreground'>
              {v.price_adjustment != null && v.price_adjustment !== 0
                ? `${v.price_adjustment > 0 ? '+' : ''}${fmt(v.price_adjustment)}`
                : '—'}
            </p>
            <div className='text-right'>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  v.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {v.is_active ? 'Active' : 'Off'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function RightPanel({
  product,
  activeImg,
  setActiveImg,
}: {
  product: any
  activeImg: number
  setActiveImg: (i: number) => void
}) {
  const images: any[] = product.images ?? []
  const hasImages = images.length > 0
  const canPrev = activeImg > 0
  const canNext = activeImg < images.length - 1

  return (
    <div className='flex flex-col gap-5 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
      {/* Image carousel */}
      <div>
        <div className='overflow-hidden rounded-2xl bg-muted/40'>
          {hasImages ? (
            <img
              src={images[activeImg]?.url}
              alt={product.name}
              className='aspect-square w-full object-cover'
            />
          ) : (
            <div className='flex aspect-square w-full items-center justify-center'>
              <Package className='h-16 w-16 text-muted-foreground/20' />
            </div>
          )}
        </div>

        {/* Nav arrows + name */}
        <div className='mt-3 flex items-center gap-3'>
          <button
            onClick={() => setActiveImg(activeImg - 1)}
            disabled={!canPrev}
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:opacity-30'
          >
            <ChevronLeft className='h-4 w-4' />
          </button>
          <div className='min-w-0 flex-1 text-center'>
            <p className='truncate text-sm font-bold'>{product.name}</p>
            <p className='truncate text-xs text-muted-foreground'>{product.slug}</p>
          </div>
          <button
            onClick={() => setActiveImg(activeImg + 1)}
            disabled={!canNext}
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:opacity-30'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className='mt-2.5 flex gap-2 overflow-x-auto pb-1'>
            {images.map((img: any, i: number) => (
              <button
                key={img.id ?? i}
                onClick={() => setActiveImg(i)}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  activeImg === i ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt='' className='h-full w-full object-cover' />
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Variants list (= "Product order history" equivalent) */}
      <div>
        <p className='mb-3 text-sm font-semibold'>
          {product.variants?.length > 0 ? 'Product Variants' : 'Product Info'}
        </p>

        <div className='overflow-hidden rounded-xl border text-sm'>
          {/* Header */}
          <div className='border-b bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            No:
          </div>

          {product.variants?.length > 0 ? (
            <div className='divide-y'>
              {product.variants.map((v: any, i: number) => (
                <div key={v.id} className='flex items-center justify-between px-4 py-3'>
                  <div className='flex items-center gap-2 min-w-0'>
                    {v.color_hex && (
                      <div
                        className='h-3.5 w-3.5 shrink-0 rounded-full border'
                        style={{ backgroundColor: v.color_hex }}
                      />
                    )}
                    <span className='truncate font-medium'>
                      {[v.size, v.color].filter(Boolean).join(' · ') || `Variant ${i + 1}`}
                    </span>
                  </div>
                  <span className='shrink-0 text-xs text-muted-foreground'>
                    {v.stock} in stock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='divide-y'>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-muted-foreground'>Stock</span>
                <span className='font-medium'>{product.stock ?? 0} units</span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-muted-foreground'>Sales</span>
                <span className='font-medium'>{product.sales_count ?? 0} orders</span>
              </div>
              <div className='flex items-center justify-between px-4 py-3'>
                <span className='text-muted-foreground'>Rating</span>
                <span className='font-medium'>
                  {product.rating ? `${Number(product.rating).toFixed(1)} ★` : '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductDetailSheetProps {
  productId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailSheet({ productId, open, onOpenChange }: ProductDetailSheetProps) {
  const { data, isLoading } = useAdminProduct(open ? productId : 0)
  const updateStatus = useUpdateProductStatus()

  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('description')
  const [sellerOpen, setSellerOpen] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState(false)

  const product = data?.data

  function handleStatusChange(status: string, msg: string) {
    updateStatus.mutate(
      { id: productId, status },
      {
        onSuccess: () => toast.success(msg),
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
          setActiveTab('description')
        }}
      >
        <SheetContent className='flex flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl'>
          <SheetTitle className='sr-only'>Product #{productId}</SheetTitle>

          {isLoading ? (
            <div className='flex flex-1 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : !product ? (
            <div className='flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Package className='h-10 w-10 opacity-20' />
              <p className='text-sm'>Product not found.</p>
            </div>
          ) : (
            <>
              {/* ─── Sticky header ─── */}
              <div className='shrink-0 border-b bg-background px-6 pb-4 pt-5 pr-14'>
                {/* Title row */}
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <h2 className='truncate text-xl font-bold leading-tight'>{product.name}</h2>
                    <p className='mt-0.5 text-sm text-muted-foreground'>
                      #{product.slug ?? product.id}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 shrink-0 gap-1.5 text-xs'
                    onClick={() => window.print()}
                  >
                    <Printer className='h-3.5 w-3.5' />
                    Print
                  </Button>
                </div>

                {/* Status + price row */}
                <div className='mt-3 flex flex-wrap items-center gap-5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground'>Status</span>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground'>Price (MSRP)</span>
                    <span className='text-lg font-bold'>{fmt(product.price)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className='mt-3 flex flex-wrap items-center gap-2'>
                  {product.status !== 'approved' && (
                    <Button
                      size='sm'
                      className='h-7 gap-1.5 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700'
                      onClick={() => handleStatusChange('approved', 'Product approved.')}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className='h-3.5 w-3.5' />
                      Approve
                    </Button>
                  )}
                  {product.status !== 'flagged' && product.status !== 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-7 gap-1.5 border-amber-300 px-3 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950'
                      onClick={() => handleStatusChange('flagged', 'Product flagged.')}
                      disabled={updateStatus.isPending}
                    >
                      <AlertTriangle className='h-3.5 w-3.5' />
                      Flag
                    </Button>
                  )}
                  {product.status !== 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-7 gap-1.5 border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950'
                      onClick={() => setRemoveConfirm(true)}
                      disabled={updateStatus.isPending}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      Remove
                    </Button>
                  )}
                  {product.status === 'removed' && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-7 px-3 text-xs'
                      onClick={() => handleStatusChange('pending_review', 'Product restored to review.')}
                      disabled={updateStatus.isPending}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>

              {/* ─── Scrollable body ─── */}
              <div className='flex-1 overflow-y-auto'>
                <div className='grid grid-cols-1 gap-0 lg:grid-cols-[1fr_280px]'>

                  {/* ─── Left column ─── */}
                  <div className='px-6 py-5'>
                    {/* Tab bar */}
                    <div className='mb-4 flex items-center justify-between border-b'>
                      <div className='flex'>
                        {TABS.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                              'border-b-2 pb-2.5 pr-5 text-sm font-semibold transition-colors',
                              activeTab === tab.id
                                ? 'border-foreground text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'description' && (
                      <DescriptionTab product={product} onSellerClick={() => setSellerOpen(true)} />
                    )}
                    {activeTab === 'insights' && <InsightsTab product={product} />}
                    {activeTab === 'inventory' && <InventoryTab product={product} />}
                  </div>

                  {/* ─── Right column ─── */}
                  <div className='px-5 pb-8 pt-5'>
                    <RightPanel
                      product={product}
                      activeImg={activeImg}
                      setActiveImg={setActiveImg}
                    />
                  </div>
                </div>
              </div>
            </>
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
            <AlertDialogTitle>Remove this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{product?.name}</strong> will be hidden from the platform.
              You can restore it later by changing the status back to review.
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
