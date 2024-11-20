import Link from 'next/link'
import CreateUpdateSalesReceivedComponents from '../../create/create-update-sales-received-components'
import { getSalesReceivedDefaultFunction } from '@/types/sales-received/sales-receive'
import { salesReceiveToSalesReceiveItems } from '@/types/sales-received/sales-receive-item'
import { getUnpaidBills } from '@/types/sales-received/unpaid-bill'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import { getDepositAmount } from '@/actions/get-deposit-amount'
import { unpaidBillsToSalesReceivedItems } from '@/types/sales-received/unpaid-bills-to-sales-Received-item'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export default async function SalesReceivedEditPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const salesReceived = await getSalesReceivedDefaultFunction({ documentNo })
    if (!salesReceived[0] || !salesReceived[0].SalesReceived) {
        return (
            <>
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
    const depositAmount = await getDepositAmount(
        salesReceived[0].SalesReceived.contactId,
        { salesReceivedIds: [salesReceived[0].SalesReceived.id] }
    )
    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขใบเสร็จรับเงิน
            </h1>
            <CreateUpdateSalesReceivedComponents
                key={documentNo}
                existingSalesReceived={salesReceived[0]}
                existingSalesReceivedItems={salesReceivedItems}
                unpaidItems={unpaidItems}
                paymentMethods={paymentMethods}
                depositAmount={depositAmount}
            />
        </>
    )
}
