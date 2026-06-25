import { z } from 'zod'

export const bannerSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  image: z.string(),
  link_type: z.enum(['category', 'product', 'store', 'url']),
  link_value: z.string(),
  sort_order: z.number(),
  is_active: z.union([z.boolean(), z.number()]),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type Banner = z.infer<typeof bannerSchema>
