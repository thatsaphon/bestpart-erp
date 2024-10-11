import React from 'react'
import CreateUpdateJournalVoucher from './create-update-journal-voucher'
import prisma from '@/app/db/db'

type Props = {}

export default async function CreateJournalVoucherPage({}: Props) {
    const chartOfAccounts = await prisma.chartOfAccount.findMany({})

    return (
        <>
            <CreateUpdateJournalVoucher chartOfAccounts={chartOfAccounts} />
        </>
    )
}
