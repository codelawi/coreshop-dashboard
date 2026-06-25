import { Loader2 } from 'lucide-react'
import { useProducts } from '@/hooks/api/use-products'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsTable } from './components/products-table'
import type { Product } from './data/schema'

export function Products() {
  const { data, isLoading } = useProducts({ per_page: 100 })
  const products: Product[] = data?.data ?? []

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <Search />
          <ThemeSwitch />
          
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Products</h1>
          <p className='text-sm text-muted-foreground'>
            View and moderate all seller products on the platform.
          </p>
        </div>
        {isLoading ? (
          <div className='flex h-[300px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <ProductsTable data={products} />
        )}
      </Main>
    </>
  )
}
