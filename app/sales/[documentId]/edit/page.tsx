import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import React from 'react'
import EditSales from './edit-sales-component'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'

type Props = {
    params: { documentId: string }
}

export default async function EditSalesInvoicePage({
    params: { documentId },
}: Props) {
    const session = await getServerSession(authOptions)

    if (session?.user.role !== 'ADMIN') {
        return <>Unauthorized</>
    }
    const document = await getSalesInvoiceDetail(documentId)

    return <EditSales document={document} />
}
