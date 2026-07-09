import { ShoppingBag } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid h-svh lg:grid-cols-2'>
      {/* Branding panel — desktop only */}
      <div className='relative hidden flex-col items-center justify-center overflow-hidden bg-primary lg:flex'>
        <div className='flex flex-col items-center gap-5 text-primary-foreground'>
          <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm'>
            <ShoppingBag className='h-10 w-10 text-primary-foreground' />
          </div>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight'>CoreShop</h1>
            <p className='mt-1 text-primary-foreground/70'>Admin Portal</p>
          </div>
          <p className='mt-4 max-w-xs text-center text-sm leading-relaxed text-primary-foreground/60'>
            Manage your marketplace — orders, products, stores, and sellers all
            in one place.
          </p>
        </div>

        {/* Decorative circles */}
        <div className='absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/5' />
        <div className='absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/5' />
      </div>

      {/* Form panel */}
      <div className='flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm space-y-6'>
          {/* Mobile logo (hidden on desktop) */}
          <div className='flex flex-col items-center gap-3 lg:hidden'>
            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-primary'>
              <ShoppingBag className='h-7 w-7 text-primary-foreground' />
            </div>
            <div className='text-center'>
              <h1 className='text-2xl font-bold'>CoreShop</h1>
              <p className='text-sm text-muted-foreground'>Admin Portal</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
