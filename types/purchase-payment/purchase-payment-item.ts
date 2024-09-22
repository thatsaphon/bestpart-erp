import { GetPurchasePayment } from './purchase-payment'

export type PurchasePaymentItem = {
    id: number
    type: 'Purchase' | 'PurchaseReturn'
    date: Date
    documentId: number
    documentNo: string
    amount: number
}

export const purchasePaymentToPurchasePaymentItems = (
    purchasePayment: GetPurchasePayment
): PurchasePaymentItem[] => {
    const purchasePaymentItems: PurchasePaymentItem[] = []
    const purchase =
        purchasePayment.PurchasePayment?.Purchase.map((x) => ({
            id: x.id,
            type: 'Purchase' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAp ? a + -b.amount : a),
                0
            ),
        })) || []

    const purchaseReturn =
        purchasePayment.PurchasePayment?.PurchaseReturn.map((x) => ({
            id: x.id,
            type: 'PurchaseReturn' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAp ? a + -b.amount : a),
                0
            ),
        })) || []

    purchasePaymentItems.push(...purchase, ...purchaseReturn)

    return purchasePaymentItems
}
