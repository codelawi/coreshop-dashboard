import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useUser, useAdminToggleEmailVerify } from '@/hooks/api/use-users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface UserProfileSheetProps {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
}

const ROLE_COLORS: Record<string, string> = {
  seller: 'bg-blue-100 text-blue-700',
  client: 'bg-purple-100 text-purple-700',
  driver: 'bg-orange-100 text-orange-700',
  admin: 'bg-gray-100 text-gray-700',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function UserProfileSheet({ userId, open, onOpenChange }: UserProfileSheetProps) {
  const { data, isLoading } = useUser(open ? userId : 0)
  const toggleVerify = useAdminToggleEmailVerify()
  const [verifyLoading, setVerifyLoading] = useState(false)

  const user = data?.data

  const handleToggleVerify = () => {
    if (!user) return
    setVerifyLoading(true)
    toggleVerify.mutate(user.id, {
      onSuccess: (res) => toast.success(res.message ?? 'Email verification updated.'),
      onError: () => toast.error('Failed to update email verification.'),
      onSettled: () => setVerifyLoading(false),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>User Profile</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : !user ? (
          <div className='flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <User className='h-8 w-8 opacity-30' />
            <p className='text-sm'>User not found.</p>
          </div>
        ) : (
          <div className='mt-4 space-y-6 px-4 pb-6'>
            {/* Avatar + name header */}
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className='text-lg font-semibold'>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <h2 className='text-xl font-bold'>{user.name}</h2>
                <div className='mt-1 flex flex-wrap gap-1.5'>
                  <Badge variant='secondary' className={`capitalize ${ROLE_COLORS[user.role] ?? ''}`}>
                    {user.role}
                  </Badge>
                  <Badge variant='secondary' className={`capitalize ${STATUS_COLORS[user.status] ?? ''}`}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact info */}
            <div className='space-y-3 text-sm'>
              <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Contact</p>

              <div className='flex items-start gap-3'>
                <Mail className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                <div className='min-w-0'>
                  <p className='break-all'>{user.email}</p>
                  <div className='mt-0.5 flex items-center gap-1.5'>
                    {user.email_verified_at ? (
                      <span className='flex items-center gap-1 text-xs text-green-600'>
                        <CheckCircle2 className='h-3 w-3' /> Verified
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <XCircle className='h-3 w-3' /> Not verified
                      </span>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-5 px-1.5 text-xs'
                      onClick={handleToggleVerify}
                      disabled={verifyLoading}
                    >
                      {verifyLoading ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      ) : user.email_verified_at ? (
                        <>
                          <ShieldAlert className='me-1 h-3 w-3' /> Unverify
                        </>
                      ) : (
                        <>
                          <ShieldCheck className='me-1 h-3 w-3' /> Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {user.phone && (
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <p>{user.phone}</p>
                </div>
              )}

              {user.city && (
                <div className='flex items-center gap-3'>
                  <MapPin className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <p>{user.city}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Account details */}
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='rounded-lg border p-3'>
                <p className='text-xs text-muted-foreground'>User ID</p>
                <p className='mt-0.5 font-mono font-semibold'>#{user.id}</p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-xs text-muted-foreground'>Joined</p>
                <p className='mt-0.5 font-semibold'>{user.created_at}</p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-xs text-muted-foreground'>Role</p>
                <p className='mt-0.5 font-semibold capitalize'>{user.role}</p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-xs text-muted-foreground'>Status</p>
                <p className='mt-0.5 font-semibold capitalize'>{user.status}</p>
              </div>
            </div>

            {/* Store link if seller */}
            {user.store && (
              <>
                <Separator />
                <div>
                  <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Store
                  </p>
                  <Link
                    to='/stores/$storeId'
                    params={{ storeId: String(user.store.id) }}
                    className='flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors'
                    onClick={() => onOpenChange(false)}
                  >
                    {user.store.logo ? (
                      <img
                        src={user.store.logo}
                        alt={user.store.name}
                        className='h-10 w-10 rounded-lg object-cover'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                        <Store className='h-5 w-5 text-muted-foreground' />
                      </div>
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium'>{user.store.name}</p>
                      <Badge
                        variant='outline'
                        className='mt-0.5 text-xs capitalize'
                      >
                        {user.store.status}
                      </Badge>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
