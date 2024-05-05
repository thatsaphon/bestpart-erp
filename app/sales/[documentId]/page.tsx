import { Table, TableCaption } from '@/components/ui/table'
import InvoiceDetailComponent from '@/components/invoice-detail-component'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
    params: { documentId: string }
}

export default async function InvoiceDetailPage({
    params: { documentId },
}: Props) {
    const document = await getSalesInvoiceDetail(documentId)

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
            <InvoiceDetailComponent document={document} />
        </>
    )
}
