import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { ResolvingMetadata, Metadata } from 'next'
import { Table, TableCaption } from '@/components/ui/table'
import CreateOrUpdatePurchaseReturnInvoiceComponent from '../../create/create-update-purchase-return-invoice-component'
import { getPurchaseReturnDefaultFunction } from '@/types/purchase-return/purchase-return'

type Props = { params: { documentNo: string } }

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `แก้ไขใบคืนสินค้า - ${params.documentNo}`,
    }
}

export default async function EditPurchaseInvoicePage({
    params: { documentNo },
}: Props) {
    const [document] = await getPurchaseReturnDefaultFunction({
        documentNo,
        type: 'PurchaseReturn',
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
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขรายละเอียดบิลขาย
            </h1>
            <CreateOrUpdatePurchaseReturnInvoiceComponent
                existingPurchaseReturn={document}
            />
        </div>
    )
}
