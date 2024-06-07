import { getContactDetail } from '@/app/actions/contact/getContactDetail'
import prisma from '@/app/db/db'

import React from 'react'
import ReceivableTable from './receivable-table'

type Props = {
    params: { id: string }
}

export default async function ContactReceivablePage({ params: { id } }: Props) {
    const contact = await getContactDetail(id)
    const documents = await prisma.document.findMany({
        where: {
            ArSubledger: {
                contactId: +id,
            },
        },
        include: {
            GeneralLedger: {
                where: {
                    OR: [
                        { chartOfAccountId: 11000 },
                        { chartOfAccountId: 12000 },
                    ],
                },
            },
            ArSubledger: true,
        },
        orderBy: { date: 'desc' },
    })

    return (
        <div className="mb-2 p-3">
            <h1 className="text-3xl">{contact?.name} </h1>
            <ReceivableTable documents={documents} />
        </div>
    )
}
