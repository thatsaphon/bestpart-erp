'use server'

import { $Enums } from '@prisma/client'
import { z } from 'zod'
import prisma from '../db/db'
import { revalidatePath } from 'next/cache'

export async function createChartOfAccounts(
  prevState: any,
  formData: FormData
) {
  const [firstKey, ...otherKeys] = Object.keys(
    $Enums.AccountType
  ) as (keyof typeof $Enums.AccountType)[]

  const schema = z.object({
    id: z.number().positive().int(),
    name: z.string().min(1),
    type: z.enum([firstKey, ...otherKeys]),
  })

  try {
    const { id, name, type } = schema.parse({
      id: Number(formData.get('accountNumber')),
      name: formData.get('accountName'),
      type: formData.get('accountType'),
    })

    await prisma.chartOfAccount.create({
      data: {
        id,
        name,
        type,
      },
    })
    revalidatePath('/accounting')
    return { message: 'success' }
  } catch (err) {
    console.log(err)
    console.log('error in createChartOfAccounts')
    return { message: 'failed' }
  }
}
