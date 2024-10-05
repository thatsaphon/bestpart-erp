import { GetOtherPayment } from './other-payment'

export type OtherPaymentItem = {
    id: number
    type: 'OtherInvoice'
    date: Date
    documentId: number
    documentNo: string
    amount: number
}

export const otherPaymentToOtherPaymentItems = (
    purchasePayment: GetOtherPayment
): OtherPaymentItem[] => {
    const otherPaymentItems: OtherPaymentItem[] = []
    const otherInvoice =
        purchasePayment.OtherPayment?.OtherInvoice.map((x) => ({
            id: x.id,
            type: 'OtherInvoice' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAp ? a + -b.amount : a),
                0
            ),
        })) || []

    otherPaymentItems.push(...otherInvoice)

    return otherPaymentItems
}
