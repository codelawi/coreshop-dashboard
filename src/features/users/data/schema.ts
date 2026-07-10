import { z } from 'zod'

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('seller'),
  z.literal('client'),
  z.literal('driver'),
])
export type UserRole = z.infer<typeof userRoleSchema>

const _userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  city: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  status: userStatusSchema,
  role: userRoleSchema,
  email_verified_at: z.string().nullable().optional(),
  store: z
    .object({
      id: z.number(),
      name: z.string(),
      status: z.string(),
      logo: z.string().nullable(),
    })
    .nullable()
    .optional(),
  created_at: z.string(),
})
export type User = z.infer<typeof _userSchema>
