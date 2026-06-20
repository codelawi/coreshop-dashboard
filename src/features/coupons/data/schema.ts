import { z } from 'zod'

export const couponTypeSchema = z.enum(['percentage', 'fixed'])
export type CouponType = z.infer<typeof couponTypeSchema>

export const couponSchema = z.object({
  id: z.number(),
  code: z.string(),
  type: couponTypeSchema,
  value: z.union([z.string(), z.number()]),
  min_order_amount: z.union([z.string(), z.number()]),
  usage_limit: z.number(),
  used_count: z.number(),
  active: z.boolean(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
})

export type Coupon = z.infer<typeof couponSchema>

export const couponFormSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: couponTypeSchema,
  value: z.coerce.number().positive('Value must be positive'),
  min_order_amount: z.coerce.number().min(0),
  usage_limit: z.coerce.number().int().positive('Usage limit must be positive'),
  expires_at: z.string().optional(),
  active: z.boolean(),
})

export type CouponForm = z.infer<typeof couponFormSchema>
