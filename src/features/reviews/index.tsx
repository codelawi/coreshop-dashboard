import { useState } from 'react'
import { Loader2, Star, Trash2, Package, Store } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminReviews, useDeleteReview } from '@/hooks/api/use-reviews'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Review {
  id: number
  rating: number
  comment: string | null
  type: 'product' | 'store'
  reviewer: { id: number; name: string; email: string } | null
  product: { id: number; name: string } | null
  store: { id: number; name: string } | null
  created_at: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className='ms-1 text-sm font-medium'>{rating}</span>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Reviews() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [rating, setRating] = useState('all')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useAdminReviews({
    search: search || undefined,
    type: type !== 'all' ? type : undefined,
    rating: rating !== 'all' ? rating : undefined,
    per_page: 50,
  })

  const deleteReview = useDeleteReview()
  const reviews: Review[] = data?.data ?? []

  const handleDelete = () => {
    if (!deleteId) return
    deleteReview.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Review deleted.')
        setDeleteId(null)
      },
      onError: () => toast.error('Failed to delete review.'),
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Reviews</h1>
          <p className='text-sm text-muted-foreground'>
            Moderate customer reviews across products and stores.
          </p>
        </div>

        {/* Filters */}
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <Input
            placeholder='Search comments...'
            className='h-8 w-56'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className='h-8 w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              <SelectItem value='product'>Product reviews</SelectItem>
              <SelectItem value='store'>Store reviews</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className='h-8 w-32'>
              <SelectValue placeholder='Rating' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All ratings</SelectItem>
              <SelectItem value='5'>⭐⭐⭐⭐⭐ 5</SelectItem>
              <SelectItem value='4'>⭐⭐⭐⭐ 4</SelectItem>
              <SelectItem value='3'>⭐⭐⭐ 3</SelectItem>
              <SelectItem value='2'>⭐⭐ 2</SelectItem>
              <SelectItem value='1'>⭐ 1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : reviews.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <Star className='h-10 w-10 opacity-30' />
            <p className='text-sm'>No reviews found.</p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-7 w-7'>
                          <AvatarFallback className='text-xs'>
                            {review.reviewer
                              ? getInitials(review.reviewer.name)
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium leading-none'>
                            {review.reviewer?.name ?? '—'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {review.reviewer?.email ?? '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={
                          review.type === 'product'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-purple-200 bg-purple-50 text-purple-700'
                        }
                      >
                        {review.type === 'product' ? (
                          <Package className='me-1 h-3 w-3' />
                        ) : (
                          <Store className='me-1 h-3 w-3' />
                        )}
                        {review.type}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {review.type === 'product'
                        ? review.product?.name ?? '—'
                        : review.store?.name ?? '—'}
                    </TableCell>
                    <TableCell className='max-w-56'>
                      <p className='truncate text-sm text-muted-foreground'>
                        {review.comment ?? (
                          <span className='italic'>No comment</span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {review.created_at}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-destructive hover:bg-destructive/10'
                              onClick={() => setDeleteId(review.id)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete review</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the review. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={handleDelete}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending && (
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
