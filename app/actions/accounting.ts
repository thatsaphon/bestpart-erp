'use server'

import { $Enums } from '@prisma/client'
import { z } from 'zod'
import prisma from '../db/db'

export async function createChartOfAccounts(
  prevState: string,
  formData: FormData
) {
  const [firstKey, ...otherKeys] = Object.keys(
    $Enums.AccountType
  ) as (keyof typeof $Enums.AccountType)[]

  const schema = z.object({
    accountNumber: z.number().positive().int(),
    accountName: z.string().min(1),
    accountType: z.enum([firstKey, ...otherKeys]),
  })

  try {
    const { accountName, accountNumber, accountType } = schema.parse({
      accountNumber: Number(formData.get('accountNumber')),
      accountName: formData.get('accountName'),
      accountType: formData.get('accountType'),
    })

    await prisma.chartOfAccount.create({
      data: {
        id: accountNumber,
        name: accountName,
        type: accountType,
      },
    })

    return 'success'
  } catch (err) {
    console.log(err)
    console.log('error in createChartOfAccounts')
    return 'failed'
  }
}