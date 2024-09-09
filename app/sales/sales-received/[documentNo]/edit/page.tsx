import Link from 'next/link'
import React from 'react'
import CreateUpdateSalesReceivedComponents from '../../create/create-update-sales-received-components'
import prisma from '@/app/db/db'
import { getUnpaidInvoices } from '@/types/sales-bill/unpaid-invoice'
import { unpaidInvoiceToSalesBillItems } from '@/types/sales-bill/unpaid-invoice-to-sales-bill-item'
import { salesBillToSalesBillItems } from '@/types/sales-bill/sales-bill-item'
import { getSalesReceivedDefaultFunction } from '@/types/sales-received/sales-receive'
import { salesReceiveToSalesReceiveItems } from '@/types/sales-received/sales-receive-item'
import { unpaidBillsToSalesReceivedItems } from '@/types/sales-received/unpaid-bills-to-sales-Received-item copy'
import { getUnpaidBills } from '@/types/sales-received/unpaid-bill'
import { getPaymentMethods } from '@/app/actions/accounting'

type Props = {
    params: {
        documentNo: string
    }
}

export default async function SalesReceivedEditPage({
    params: { documentNo },
}: Props) {
    const salesReceived = await getSalesReceivedDefaultFunction({ documentNo })
    if (!salesReceived[0] || !salesReceived[0].SalesReceived) {
        return (
            <>
                <div className="flex justify-between">
                    <Link
                        href={`/sales/sales-bill`}
                        className="text-primary/50 underline hover:text-primary"
                    >{`< ย้อนกลับ`}</Link>
                </div>
                <h1 className="my-2 text-3xl transition-colors">
                    สร้างใบวางบิล
                </h1>
                <h1 className="my-2 text-3xl transition-colors">ไม่พบข้อมูล</h1>
            </>
        )
    }
    const salesReceivedItems = await salesReceiveToSalesReceiveItems(
        salesReceived[0]
    )

    const unpaidInvoices = await getUnpaidBills(
        salesReceived[0].SalesReceived?.contactId
    )

    const paymentMethods = await getPaymentMethods()

    const unpaidItems = unpaidBillsToSalesReceivedItems(unpaidInvoices)
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-bill`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขใบเสร็จรับเงิน
            </h1>
            <CreateUpdateSalesReceivedComponents
                key={documentNo}
                existingSalesReceived={salesReceived[0]}
                existingSalesReceivedItems={salesReceivedItems}
                unpaidItems={unpaidItems}
                paymentMethods={paymentMethods}
            />
        </>
    )
}
