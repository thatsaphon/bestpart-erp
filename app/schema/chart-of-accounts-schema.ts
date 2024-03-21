import { $Enums } from '@prisma/client'
import { z } from 'zod'

const [firstKey, ...otherKeys] = Object.keys(
  $Enums.AccountType
) as (keyof typeof $Enums.AccountType)[]

export const chartOfAccountSchema = z.object({
  id: z.coerce.number().positive().int(),
  name: z.string(),
  type: z.enum([firstKey, ...otherKeys]),
})
