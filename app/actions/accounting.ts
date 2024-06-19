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
        accountOwners: z.array(z.string()),
    })

    try {
        const { id, name, type, accountOwners } = schema.parse({
            id: Number(formData.get('accountNumber')),
            name: formData.get('accountName'),
            type: formData.get('accountType'),
            accountOwners: formData.getAll('accountOwners'),
        })

        const userOwners = await prisma.user.findMany({
            where: { username: { in: accountOwners } },
        })

        await prisma.chartOfAccount.create({
            data: {
                id,
                name,
                type,
                AccountOwner: {
                    create: userOwners.map((user) => ({ userId: user.id })),
                    // createMany: {
                    //     data: userOwners.map((user) => ({ userId: user.id })),
                    // },
                },
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

export async function deleteChartOfAccount(id: number) {
    const account = await prisma.chartOfAccount.findUnique({
        where: { id },
        include: { GeneralLedger: true },
    })
    if (!account) throw new Error('Not Found')
    if (account.GeneralLedger.length)
        throw new Error('cannot delete this account')
    console.log('success')
    await prisma.$transaction([
        prisma.accountOwner.deleteMany({ where: { chartOfAccountId: id } }),
        prisma.chartOfAccount.delete({
            where: { id },
            include: { AccountOwner: true },
        }),
    ])
    revalidatePath('/accounting')
}

export async function getPaymentMethods() {
    return await prisma.chartOfAccount.findMany({
        where: { AND: [{ id: { gte: 11000 } }, { id: { lte: 12000 } }] }
    })
}