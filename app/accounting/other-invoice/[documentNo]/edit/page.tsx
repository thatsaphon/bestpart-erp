import Link from 'next/link'
import React from 'react'
import prisma from '@/app/db/db'
import CreateUpdateOtherInvoiceComponent from '../../create/create-update-other-invoice'
import { AccountType, AssetType, DocumentRemark, Prisma } from '@prisma/client'
import { getOtherInvoiceDefaultFunction } from '@/types/other-invoice/other-invoice'
import { getServiceAndNonStockItemsDefaultFunction } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { getPaymentMethods } from '@/actions/get-payment-methods'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export default async function UpdateOtherExpensePage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    //PENDING
    const paymentMethods = await getPaymentMethods()

    const [existingOtherInvoice] = await getOtherInvoiceDefaultFunction({
        documentNo,
    })

    if (!existingOtherInvoice) {
        return <h1 className="my-2 text-2xl transition-colors">ไม่พบข้อมูล</h1>
    }
    const nonStockItems = await getServiceAndNonStockItemsDefaultFunction({
        canOtherInvoice: true,
    })
    return (
        <>
            <h1 className="my-2 text-2xl transition-colors">
                บันทึกบิลค่าใช้จ่ายใหม่
            </h1>
            <CreateUpdateOtherInvoiceComponent
                paymentMethods={paymentMethods}
                existingOtherInvoice={existingOtherInvoice}
                nonStockItems={nonStockItems}
            />
        </>
    )
}
