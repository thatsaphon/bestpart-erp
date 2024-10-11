'use server'

import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import prisma from '@/app/db/db'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const createJournalVoucher = async (
    journalDescription: string,
    date: Date,
    items: {
        chartOfAccountId: number
        amount: number
    }[],
    documentNo: string,
    remarks: GetDocumentRemark[]
) => {
    if (!documentNo) {
        documentNo = await generateDocumentNumber('JV', date)
    }
    const session = await getServerSession(authOptions)
    const result = await prisma.document.create({
        data: {
            date: date,
            documentNo: documentNo,
            type: 'JournalVoucher',
            address: '',
            contactName: '',
            phone: '',
            taxId: '',
            JournalVoucher: {
                create: {
                    journalDescription,
                    GeneralLedger: {
                        create: items.map(({ chartOfAccountId, amount }) => ({
                            chartOfAccountId: chartOfAccountId,
                            amount: amount,
                        })),
                    },
                },
            },
            DocumentRemark: {
                create: remarks.map(({ remark }) => ({
                    remark: remark,
                    userId: session?.user.id,
                })),
            },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
        },
    })

    revalidatePath('/accounting/journal-voucher')
    redirect('/accounting/journal-voucher/' + result.documentNo)
}
