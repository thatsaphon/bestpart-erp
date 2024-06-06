'use server'

import { generateDocumentNumber } from '@/lib/generateDocumentNumber'
import prisma from '@/app/db/db'

export const receivedFromBill = async (
    billId: string,
    date: Date,
    amount: number,
    accountNumber: string,
    remark: string,
    handleDifference?: 'outstanding' | 'discount'
) => {
    const receivedId = await generateDocumentNumber('RV', date.toISOString())
    console.log(receivedId)
    // await prisma.document.create({

    // })
}
