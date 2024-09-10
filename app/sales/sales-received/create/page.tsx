import { Metadata } from 'next'
import CreateUpdateSalesReceivedComponents from './create-update-sales-received-components'
import Link from 'next/link'
import prisma from '@/app/db/db'
import { getUnpaidInvoices } from '@/types/sales-bill/unpaid-invoice'
import { unpaidInvoiceToSalesBillItems } from '@/types/sales-bill/unpaid-invoice-to-sales-bill-item'
import { getUnpaidBills } from '@/types/sales-received/unpaid-bill'
import { unpaidBillsToSalesReceivedItems } from '@/types/sales-received/unpaid-bills-to-sales-Received-item copy'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { getDepositAmount } from '@/actions/get-deposit-amount'

type Props = {
    searchParams: {
        contactId?: string
    }
}

export const metadata: Metadata = {
    title: 'สร้างใบวางบิล',
}

export default async function CreateBillPage({
    searchParams,
    searchParams: { contactId },
}: Props) {
    const unpaidInvoices = Number(contactId)
        ? await getUnpaidBills(Number(contactId))
        : []

    const unpaidItems = unpaidBillsToSalesReceivedItems(unpaidInvoices)

    const paymentMethods = await getPaymentMethods()

    const depositAmount = await getDepositAmount(Number(contactId))

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-bill`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                สร้างใบเสร็จรับเงิน
            </h1>
            <CreateUpdateSalesReceivedComponents
                unpaidItems={unpaidItems}
                paymentMethods={paymentMethods}
                depositAmount={depositAmount}
            />
        </>
    )
}
