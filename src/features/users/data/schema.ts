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
  status: userStatusSchema,
  role: userRoleSchema,
  created_at: z.string(),
})
export type User = z.infer<typeof _userSchema>
