import CreateOrUpdatePurchaseInvoiceComponent from '../../create/create-update-purchase-invoice-component'
import { getPurchaseDefaultFunction } from '@/types/purchase/purchase'
import { getPurchaseOrderDefaultFunction } from '@/types/purchase-order/purchase-order'

type Props = { params: { documentNo: string } }

export default async function EditPurchaseInvoicePage({
    params: { documentNo },
}: Props) {
    const [purchaseInvoice] = await getPurchaseDefaultFunction({
        documentNo,
        type: 'PurchaseReceived',
    })
    if (!purchaseInvoice) return null

    const pendingOrExistingPurchaseOrders =
        await getPurchaseOrderDefaultFunction({
            OR: [
                {
                    PurchaseOrder: {
                        status: {
                            in: ['Draft', 'PartiallyReceived', 'Submitted'],
                        },
                    },
                },
                {
                    id: {
                        in: purchaseInvoice?.Purchase?.PurchaseOrder.map(
                            (purchaseOrder) => purchaseOrder.documentId
                        ),
                    },
                },
            ],
        })
    return (
        <div className="pb-24">
            <h1 className="my-2 text-3xl transition-colors">สร้างบิลซื้อ</h1>
            <CreateOrUpdatePurchaseInvoiceComponent
                existingPurchaseReceived={purchaseInvoice}
                pendingOrExistingPurchaseOrders={
                    pendingOrExistingPurchaseOrders
                }
            />
        </div>
    )
}
