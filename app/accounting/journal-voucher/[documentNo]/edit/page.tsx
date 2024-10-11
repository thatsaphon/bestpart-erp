import prisma from '@/app/db/db'
import React from 'react'
import CreateUpdateJournalVoucher from '../../create/create-update-journal-voucher'
import { getJournalVoucherDefaultFunction } from '@/types/journal-voucher/journal-voucher'

type Props = { params: { documentNo: string } }

export default async function EditJournalVoucherPage({
    params: { documentNo },
}: Props) {
    const chartOfAccounts = await prisma.chartOfAccount.findMany({})
    const [existingJournalVoucher] = await getJournalVoucherDefaultFunction({
        where: {
            documentNo,
        },
    })
    return (
        <>
            <CreateUpdateJournalVoucher
                chartOfAccounts={chartOfAccounts}
                existingJournalVoucher={existingJournalVoucher}
            />
        </>
    )
}
