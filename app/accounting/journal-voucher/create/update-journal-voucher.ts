'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateJournalVoucher = async (
    documentId: number,
    journalDescription: string,
    date: Date,
    items: {
        chartOfAccountId: number
        amount: number
    }[],
    documentNo: string,
    remarks: GetDocumentRemark[]
) => {
    const document = await prisma.document.findUniqueOrThrow({
        where: {
            id: documentId,
        },
        include: {
            JournalVoucher: true,
        },
    })
    const session = await getServerSession(authOptions)

    const result = await prisma.document.update({
        where: {
            id: documentId,
        },
        data: {
            date: date,
            documentNo: documentNo,
            JournalVoucher: {
                update: {
                    journalDescription,
                    GeneralLedger: {
                        deleteMany: {
                            journalVoucherId: document.JournalVoucher?.id,
                        },
                        create: items.map(({ chartOfAccountId, amount }) => ({
                            chartOfAccountId: chartOfAccountId,
                            amount: amount,
                        })),
                    },
                },
            },
            DocumentRemark: {
                create: remarks
                    .map(({ id, remark }) => ({
                        id,
                        remark,
                        userId: session?.user.id,
                    }))
                    .filter(({ id }) => !id),
                update: remarks
                    .filter(({ id }) => id)
                    .map((remark) => ({
                        where: { id: remark.id },
                        data: {
                            remark: remark.remark,
                            isDeleted: remark.isDeleted,
                        },
                    })),
            },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
        },
    })

    revalidatePath('/accounting/journal-voucher')
    redirect('/accounting/journal-voucher/' + result.documentNo)
}
