import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  image: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  sort_order: z.number(),
  is_active: z.union([z.boolean(), z.number()]),
  children: z.array(z.lazy((): z.ZodTypeAny => categorySchema)).optional(),
})

export type Category = z.infer<typeof categorySchema>
