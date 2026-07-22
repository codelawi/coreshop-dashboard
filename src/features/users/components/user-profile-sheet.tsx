import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useUser,
  useAdminToggleEmailVerify,
  useUpdateUserStatus,
} from '@/hooks/api/use-users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { useState } from 'react'

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CFG: Record<string, { label: string; pill: string }> = {
  seller: { label: 'Seller', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  client: { label: 'Client', pill: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
  driver: { label: 'Driver', pill: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
  admin:  { label: 'Admin',  pill: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
}

const STATUS_CFG: Record<string, { label: string; pill: string }> = {
  active:    { label: 'Active',    pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  inactive:  { label: 'Inactive',  pill: 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400' },
  suspended: { label: 'Suspended', pill: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

type Tab = 'profile' | 'account' | 'store'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

// ─── Shared table row (same as product sheet) ─────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[160px_1fr] items-start border-b last:border-b-0'>
      <div className='px-4 py-3.5 text-sm text-muted-foreground'>{label}</div>
      <div className='border-l px-4 py-3.5 text-sm text-foreground'>{children}</div>
    </div>
  )
}

// ─── Status & role badges ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, pill: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      {cfg.label}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CFG[role] ?? { label: role, pill: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.pill}`}>
      {cfg.label}
    </span>
  )
}

// ─── Profile tab ─────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: any }) {
  return (
    <div className='overflow-hidden rounded-xl border'>
      <Row label='Email'>
        <div>
          <p className='break-all font-medium'>{user.email}</p>
          <div className='mt-1 flex items-center gap-1.5'>
            {user.email_verified_at ? (
              <span className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='h-3 w-3' />
                Verified
              </span>
            ) : (
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <XCircle className='h-3 w-3' />
                Not verified
              </span>
            )}
          </div>
        </div>
      </Row>
      {user.phone && (
        <Row label='Phone'>
          <a
            href={`tel:${user.phone}`}
            className='flex items-center gap-1.5 font-medium hover:underline'
          >
            <Phone className='h-3.5 w-3.5 text-muted-foreground' />
            {user.phone}
          </a>
        </Row>
      )}
      {user.city && (
        <Row label='City'>
          <span className='flex items-center gap-1.5 font-medium'>
            <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
            {user.city}
          </span>
        </Row>
      )}
      <Row label='Role'>
        <RoleBadge role={user.role} />
      </Row>
      <Row label='Account Status'>
        <StatusBadge status={user.status} />
      </Row>
      <Row label='User ID'>
        <span className='font-mono font-semibold text-muted-foreground'>#{user.id}</span>
      </Row>
      <Row label='Member Since'>
        <span className='text-muted-foreground'>{user.created_at}</span>
      </Row>
    </div>
  )
}

// ─── Account tab ─────────────────────────────────────────────────────────────

function AccountTab({
  user,
  onToggleVerify,
  onStatusChange,
  verifyPending,
  statusPending,
}: {
  user: any
  onToggleVerify: () => void
  onStatusChange: (s: string) => void
  verifyPending: boolean
  statusPending: boolean
}) {
  const stats = [
    { label: 'User ID', value: `#${user.id}`, sub: 'Unique identifier' },
    { label: 'Member Since', value: user.created_at?.split(' ')[0] ?? '—', sub: 'Registration date' },
    { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1), sub: 'Account type' },
    { label: 'Status', value: user.status.charAt(0).toUpperCase() + user.status.slice(1), sub: 'Account access' },
  ]

  return (
    <div className='space-y-4'>
      {/* Stat cards */}
      <div className='grid grid-cols-2 gap-3'>
        {stats.map(({ label, value, sub }) => (
          <div key={label} className='rounded-xl border p-4'>
            <p className='text-xs font-medium text-muted-foreground'>{label}</p>
            <p className='mt-1.5 text-lg font-bold tracking-tight'>{value}</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Email verification */}
      <div className='overflow-hidden rounded-xl border'>
        <div className='flex items-center justify-between px-4 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${user.email_verified_at ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-muted'}`}>
              {user.email_verified_at ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              ) : (
                <Mail className='h-4 w-4 text-muted-foreground' />
              )}
            </div>
            <div>
              <p className='text-sm font-medium'>Email Verification</p>
              <p className='text-xs text-muted-foreground'>
                {user.email_verified_at
                  ? `Verified on ${user.email_verified_at.split(' ')[0]}`
                  : 'Email not yet verified'}
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='h-7 gap-1.5 px-3 text-xs'
            onClick={onToggleVerify}
            disabled={verifyPending}
          >
            {verifyPending ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : user.email_verified_at ? (
              <>
                <ShieldAlert className='h-3.5 w-3.5' />
                Unverify
              </>
            ) : (
              <>
                <ShieldCheck className='h-3.5 w-3.5' />
                Verify
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status management */}
      <div className='overflow-hidden rounded-xl border'>
        <div className='border-b bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
          Account Status
        </div>
        <div className='divide-y'>
          {(['active', 'inactive', 'suspended'] as const).map((s) => (
            <div key={s} className='flex items-center justify-between px-4 py-3'>
              <div className='flex items-center gap-2.5'>
                <div className={`h-2 w-2 rounded-full ${s === 'active' ? 'bg-emerald-500' : s === 'suspended' ? 'bg-red-500' : 'bg-gray-400'}`} />
                <span className='text-sm font-medium capitalize'>{s}</span>
              </div>
              {user.status === s ? (
                <span className='text-xs font-semibold text-muted-foreground'>Current</span>
              ) : (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 px-2.5 text-xs'
                  onClick={() => onStatusChange(s)}
                  disabled={statusPending}
                >
                  Set
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Store tab ────────────────────────────────────────────────────────────────

function StoreTab({ user, onClose }: { user: any; onClose: () => void }) {
  if (!user.store) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-xl border py-10 text-center text-muted-foreground'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
          <Store className='h-6 w-6 opacity-40' />
        </div>
        <div>
          <p className='text-sm font-medium'>No store linked</p>
          <p className='mt-0.5 text-xs'>
            {user.role === 'seller'
              ? 'This seller hasn\'t set up a store yet.'
              : 'Only sellers can have a store.'}
          </p>
        </div>
      </div>
    )
  }

  const store = user.store

  return (
    <div className='space-y-4'>
      {/* Store card */}
      <Link
        to='/stores/$storeId'
        params={{ storeId: String(store.id) }}
        onClick={onClose}
        className='flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40'
      >
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.name}
            className='h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm'
          />
        ) : (
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted'>
            <Store className='h-7 w-7 text-muted-foreground/40' />
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <p className='font-bold'>{store.name}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>Tap to view full store details</p>
          <div className='mt-2'>
            <StatusBadge status={store.status} />
          </div>
        </div>
      </Link>

      {/* Store details table */}
      <div className='overflow-hidden rounded-xl border'>
        <Row label='Store ID'>
          <span className='font-mono font-semibold text-muted-foreground'>#{store.id}</span>
        </Row>
        <Row label='Store Name'>
          <span className='font-medium'>{store.name}</span>
        </Row>
        <Row label='Status'>
          <StatusBadge status={store.status} />
        </Row>
        {store.city && (
          <Row label='City'>
            <span className='flex items-center gap-1.5'>
              <MapPin className='h-3.5 w-3.5 text-muted-foreground' />
              {store.city}
            </span>
          </Row>
        )}
        {store.phone && (
          <Row label='Phone'>
            <a
              href={`tel:${store.phone}`}
              className='flex items-center gap-1.5 hover:underline'
            >
              <Phone className='h-3.5 w-3.5 text-muted-foreground' />
              {store.phone}
            </a>
          </Row>
        )}
      </div>
    </div>
  )
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function RightPanel({ user }: { user: any }) {
  const summaryRows = [
    { label: 'User ID', value: `#${user.id}` },
    { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
    { label: 'Status', value: user.status.charAt(0).toUpperCase() + user.status.slice(1) },
    { label: 'Email', value: user.email_verified_at ? 'Verified' : 'Unverified' },
    { label: 'Joined', value: user.created_at?.split(' ')[0] ?? '—' },
    ...(user.city ? [{ label: 'City', value: user.city }] : []),
  ]

  return (
    <div className='flex flex-col gap-5 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
      {/* Avatar card */}
      <div className='flex flex-col items-center gap-3 rounded-2xl bg-muted/30 px-4 py-8'>
        <Avatar className='h-24 w-24 ring-4 ring-background shadow-md'>
          <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
          <AvatarFallback className='text-2xl font-bold'>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className='text-center'>
          <p className='font-bold'>{user.name}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{user.email}</p>
          <div className='mt-2 flex flex-wrap items-center justify-center gap-1.5'>
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Summary table */}
      <div>
        <p className='mb-3 text-sm font-semibold'>Account Summary</p>
        <div className='overflow-hidden rounded-xl border text-sm'>
          <div className='border-b bg-muted/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            Details
          </div>
          <div className='divide-y'>
            {summaryRows.map(({ label, value }) => (
              <div key={label} className='flex items-center justify-between px-4 py-3'>
                <span className='text-muted-foreground'>{label}</span>
                <span className='font-medium'>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface UserProfileSheetProps {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileSheet({ userId, open, onOpenChange }: UserProfileSheetProps) {
  const { data, isLoading } = useUser(open ? userId : 0)
  const toggleVerify = useAdminToggleEmailVerify()
  const updateStatus = useUpdateUserStatus()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const user = data?.data

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'store', label: 'Store' },
  ]

  function handleToggleVerify() {
    if (!user) { return }
    toggleVerify.mutate(user.id, {
      onSuccess: (res: any) => toast.success(res.message ?? 'Email verification updated.'),
      onError: () => toast.error('Failed to update email verification.'),
    })
  }

  function handleStatusChange(status: string) {
    if (!user) { return }
    updateStatus.mutate(
      { id: user.id, status },
      {
        onSuccess: () => toast.success(`Account status set to ${status}.`),
        onError: () => toast.error('Failed to update status.'),
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        setActiveTab('profile')
      }}
    >
      <SheetContent className='flex flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <SheetTitle className='sr-only'>User Profile #{userId}</SheetTitle>

        {isLoading ? (
          <div className='flex flex-1 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : !user ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground'>
            <User className='h-10 w-10 opacity-20' />
            <p className='text-sm'>User not found.</p>
          </div>
        ) : (
          <>
            {/* ─── Sticky header ─── */}
            <div className='shrink-0 border-b bg-background px-6 pb-4 pt-5 pr-14'>
              {/* Title row */}
              <div className='flex items-start justify-between gap-4'>
                <div className='flex min-w-0 items-center gap-3'>
                  <Avatar className='h-10 w-10 shrink-0 ring-2 ring-border'>
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback className='text-sm font-bold'>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <h2 className='truncate text-xl font-bold leading-tight'>{user.name}</h2>
                    <p className='mt-0.5 font-mono text-sm text-muted-foreground'>#{user.id}</p>
                  </div>
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

              {/* Status + role row */}
              <div className='mt-3 flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>Role</span>
                  <RoleBadge role={user.role} />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>Status</span>
                  <StatusBadge status={user.status} />
                </div>
                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                  <Mail className='h-3.5 w-3.5' />
                  {user.email_verified_at ? (
                    <span className='text-emerald-600 dark:text-emerald-400'>Email verified</span>
                  ) : (
                    <span>Email unverified</span>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className='mt-3 flex flex-wrap gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-7 gap-1.5 px-3 text-xs'
                  onClick={handleToggleVerify}
                  disabled={toggleVerify.isPending}
                >
                  {toggleVerify.isPending ? (
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  ) : user.email_verified_at ? (
                    <>
                      <ShieldAlert className='h-3.5 w-3.5 text-amber-500' />
                      Unverify Email
                    </>
                  ) : (
                    <>
                      <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
                      Verify Email
                    </>
                  )}
                </Button>
                {user.status !== 'suspended' && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-7 gap-1.5 border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950'
                    onClick={() => handleStatusChange('suspended')}
                    disabled={updateStatus.isPending}
                  >
                    Suspend
                  </Button>
                )}
                {user.status === 'suspended' && (
                  <Button
                    size='sm'
                    className='h-7 gap-1.5 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700'
                    onClick={() => handleStatusChange('active')}
                    disabled={updateStatus.isPending}
                  >
                    Activate
                  </Button>
                )}
              </div>
            </div>

            {/* ─── Scrollable body ─── */}
            <div className='flex-1 overflow-y-auto'>
              <div className='grid grid-cols-1 gap-0 lg:grid-cols-[1fr_240px]'>

                {/* ─── Left column ─── */}
                <div className='px-6 py-5'>
                  {/* Tab bar */}
                  <div className='mb-4 flex border-b'>
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

                  {/* Tab content */}
                  {activeTab === 'profile' && <ProfileTab user={user} />}
                  {activeTab === 'account' && (
                    <AccountTab
                      user={user}
                      onToggleVerify={handleToggleVerify}
                      onStatusChange={handleStatusChange}
                      verifyPending={toggleVerify.isPending}
                      statusPending={updateStatus.isPending}
                    />
                  )}
                  {activeTab === 'store' && (
                    <StoreTab user={user} onClose={() => onOpenChange(false)} />
                  )}
                </div>

                {/* ─── Right column ─── */}
                <div className='px-5 pb-8 pt-5'>
                  <RightPanel user={user} />
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
