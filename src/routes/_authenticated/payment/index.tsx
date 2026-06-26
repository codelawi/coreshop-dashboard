import { createFileRoute } from '@tanstack/react-router'
import { PaymentSettings } from '@/features/payment'

export const Route = createFileRoute('/_authenticated/payment/')({
  component: PaymentSettings,
})
