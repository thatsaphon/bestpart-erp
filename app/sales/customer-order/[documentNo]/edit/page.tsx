import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Metadata } from 'next'
import CreateOrUpdateCustomerOrderComponent from '../../create/create-update-customer-order-component'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'

type Props = {
    params: {
        documentNo: string
    }
}

export const metadata: Metadata = {
    title: 'สร้างบิลขาย',
}

export default async function UpdateCustomerOrderPage({
    params: { documentNo },
}: Props) {
    const [document] = await getCustomerOrderDefaultFunction({ documentNo })

    if (!document) return <>ไม่พบข้อมูล</>

    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขใบจองสินค้า
            </h1>
            <CreateOrUpdateCustomerOrderComponent
                existingCustomerOrder={document}
                paymentMethods={await getPaymentMethods()}
            />
        </>
    )
}
