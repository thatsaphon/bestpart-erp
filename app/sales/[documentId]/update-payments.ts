'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'

export const updatePayments = async (id: number, payments: { id: number; amount: number }[]) => {

    const document = await prisma.document.findMany({ where: { id }, include: { SkuOut: true, GeneralLedger: true, ArSubledger: { include: { Contact: true } } } })

    if (!document.length) throw new Error('document not found')

    console.log(document[0].SkuOut.reduce((acc, skuOut) => acc + skuOut.quantity * (skuOut.price + skuOut.vat), 0))
    console.log(payments)

    if (payments.find((payment) => payment.id === 12000) && (!document[0].ArSubledger?.Contact || !document[0].ArSubledger?.Contact.credit)) {
        throw new Error(`${document[0].ArSubledger?.Contact.name || ''} ไม่สามารถขายเงินเชื่อได้`)
    }

    if (document[0].SkuOut.reduce((acc, skuOut) => acc + skuOut.quantity * (skuOut.price + skuOut.vat), 0) !== payments.reduce((acc, payment) => acc + payment.amount, 0))
        throw new Error('จำนวนเงินไม่ถูกต้อง')

    await prisma.document.update({
        where: { id },
        data: {
            GeneralLedger: {
                deleteMany: [
                    { AND: { chartOfAccountId: { gte: 11000 } }, chartOfAccountId: { lte: 12000 } }
                ],
                create: payments.map((payment) => ({ chartOfAccountId: payment.id, amount: payment.amount }))
            }
        }
    })

    revalidatePath(`/sales/${document[0].documentId}`)

}