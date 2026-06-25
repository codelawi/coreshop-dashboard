import { createFileRoute } from '@tanstack/react-router'
import { StoreDetail } from '@/features/stores'

export const Route = createFileRoute('/_authenticated/stores/$storeId/')({
  component: StoreDetail,
})
