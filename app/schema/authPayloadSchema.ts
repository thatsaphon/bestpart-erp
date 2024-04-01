import { z } from 'zod'
import { $Enums } from '@prisma/client'

const [firstKey, ...otherKeys] = Object.keys(
  $Enums.Role
) as (keyof typeof $Enums.Role)[]

export const AuthPayloadSchema = z.object({
  username: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: z.enum([firstKey, ...otherKeys]),
  flag: z.record(z.string()),
  avatarUrl: z.string().nullable(),
  accountOwners: z
    .array(z.object({ accountNumberId: z.number() }))
    .nullable()
    .optional(),
})
