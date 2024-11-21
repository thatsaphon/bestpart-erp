'use server'

import prisma from '@/app/db/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const deleteOtherPayment = async (documentNo: string) => {
    const otherPayment = await prisma.document.findFirstOrThrow({
        where: {
            documentNo,
        },
        include: {
            OtherPayment: true,
        },
    })

    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            purchasePaymentId: otherPayment.OtherPayment?.id,
        },
    })
    const deleteOtherPayment = prisma.otherPayment.delete({
        where: {
            id: otherPayment.OtherPayment?.id,
        },
    })
    const deleteDocument = prisma.document.delete({
        where: {
            documentNo,
        },
    })

    await prisma.$transaction([
        deleteGeneralLedger,
        deleteOtherPayment,
        deleteDocument,
    ])
    revalidatePath('/accounting/other-payment')
    redirect('/accounting/other-payment')
}
