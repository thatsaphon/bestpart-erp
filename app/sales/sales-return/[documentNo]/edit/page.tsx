import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { ResolvingMetadata, Metadata } from 'next'
import { getSalesReturnDefaultFunction } from '@/types/sales-return/sales-return'
import { Table, TableCaption } from '@/components/ui/table'
import CreateOrUpdateSalesReturnInvoiceComponent from '../../create/create-update-sales-return-invoice-component'

type Props = { params: { documentNo: string } }

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `แก้ไขใบรับคืนสินค้า - ${params.documentNo}`,
    }
}

export default async function EditSalesInvoicePage({
    params: { documentNo },
}: Props) {
    const [document] = await getSalesReturnDefaultFunction({
        documentNo,
        type: 'SalesReturn',
    })
    const paymentMethods = await getPaymentMethods()

    if (!document)
        return (
            <>
                <Table>
                    <TableCaption>ไม่พบข้อมูล</TableCaption>
                </Table>
            </>
        )

    return (
        <>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขรายละเอียดบิลขาย
            </h1>
            <CreateOrUpdateSalesReturnInvoiceComponent
                existingSalesReturn={document}
                paymentMethods={paymentMethods}
            />
        </>
    )
}
