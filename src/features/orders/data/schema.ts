import { z } from 'zod'

export const orderStatusSchema = z.enum([
  'pending',
  'approved',
  'preparing',
  'ready_for_pickup',
  'assigned',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export const orderSchema = z.object({
  id: z.number(),
  client: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  coupon: z
    .object({
      id: z.number(),
      code: z.string(),
    })
    .nullable(),
  status: orderStatusSchema,
  subtotal: z.union([z.string(), z.number()]),
  discount: z.union([z.string(), z.number()]),
  total: z.union([z.string(), z.number()]),
  payment_method: z.string().nullable(),
  payment_status: z.string(),
  notes: z.string().nullable(),
  items_count: z.number(),
  created_at: z.string(),
})

export type Order = z.infer<typeof orderSchema>
