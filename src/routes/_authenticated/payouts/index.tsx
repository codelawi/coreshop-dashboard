import { createFileRoute } from '@tanstack/react-router'
import { Payouts } from '@/features/payouts'

export const Route = createFileRoute('/_authenticated/payouts/')({
  component: Payouts,
})
