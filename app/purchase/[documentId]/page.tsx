import { Table, TableCaption } from '@/components/ui/table'
import InvoiceDetailComponent from '@/components/invoice-detail-component'
import { getPurchaseInvoiceDetail } from '@/app/actions/purchase/purchase-invoice-detail'
import PurchaseInvoiceDetailComponent from '@/components/purchase-invoice-detail-component'

type Props = {
    params: { documentId: string }
}

export default async function PurchaseInvoiceDetailPage({
    params: { documentId },
}: Props) {
    const document = await getPurchaseInvoiceDetail(documentId)

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
            <PurchaseInvoiceDetailComponent document={document} />
        </>
    )
}
