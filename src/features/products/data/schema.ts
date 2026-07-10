import { z } from 'zod'

export const productStatusSchema = z.enum([
  'pending_review',
  'approved',
  'flagged',
  'removed',
])

export type ProductStatus = z.infer<typeof productStatusSchema>

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.union([z.string(), z.number()]),
  stock: z.number(),
  images: z.array(z.string()).nullable(),
  status: productStatusSchema,
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
  seller: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  store: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  created_at: z.string(),
})

export type Product = z.infer<typeof productSchema>
