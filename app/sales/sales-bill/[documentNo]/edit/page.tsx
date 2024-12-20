import Link from 'next/link'
import React from 'react'
import CreateUpdateSalesBillComponents from '../../create/create-update-sales-bill-components'
import prisma from '@/app/db/db'
import { getSalesBillDefaultFunction } from '@/types/sales-bill/sales-bill'
import { getUnpaidInvoices } from '@/types/sales-bill/unpaid-invoice'
import { unpaidInvoiceToSalesBillItems } from '@/types/sales-bill/unpaid-invoice-to-sales-bill-item'
import { salesBillToSalesBillItems } from '@/types/sales-bill/sales-bill-item'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export default async function SalesBillEditPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const salesBill = await getSalesBillDefaultFunction({ documentNo })
    if (!salesBill[0] || !salesBill[0].SalesBill) {
        return (
            <>
                <h1 className="my-2 text-3xl transition-colors">
                    แก้ไขใบวางบิล
                </h1>
                <h1 className="my-2 text-3xl transition-colors">ไม่พบข้อมูล</h1>
            </>
        )
    }
    const salesBillItems = await salesBillToSalesBillItems(salesBill[0])

    const unpaidInvoices = await getUnpaidInvoices(
        salesBill[0].SalesBill?.contactId
    )
    console.log(salesBill[0])

    const unpaidItems = unpaidInvoiceToSalesBillItems(unpaidInvoices)
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบวางบิล</h1>
            <CreateUpdateSalesBillComponents
                key={documentNo}
                existingSalesBill={salesBill[0]}
                existingSalesBillItems={salesBillItems}
                unpaidItems={unpaidItems}
            />
        </>
    )
}
