import { Metadata } from 'next'
import CreateUpdateSalesBillComponents from './create-update-sales-bill-components'
import Link from 'next/link'
import prisma from '@/app/db/db'
import { getUnpaidInvoices } from '@/types/sales-bill/unpaid-invoice'
import { unpaidInvoiceToSalesBillItems } from '@/types/sales-bill/unpaid-invoice-to-sales-bill-item'

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
    const unpaidInvoices = await getUnpaidInvoices(Number(contactId))

    const unpaidItems = unpaidInvoiceToSalesBillItems(unpaidInvoices)

    console.log(unpaidItems)

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-bill`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-3xl transition-colors">สร้างใบวางบิล</h1>
            <CreateUpdateSalesBillComponents
                unpaidItems={unpaidItems}
                // paymentMethods={paymentMethods}
            />
        </>
    )
}
