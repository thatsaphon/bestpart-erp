import { OtherPaymentItem } from './other-payment-item'
import { GetUnpaidOtherInvoice } from './unpaid-other-invoice'

export const unpaidOtherInvoiceToOtherInvoicePaymentItems = (
    unpaidPurchases: GetUnpaidOtherInvoice[]
): OtherPaymentItem[] => {
    return unpaidPurchases
        .map((x) => {
            if (x.OtherInvoice) {
                return {
                    id: x.OtherInvoice.id,
                    type: 'OtherInvoice' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.OtherInvoice.GeneralLedger.reduce(
                        (a, b) => (b.ChartOfAccount.isAp ? a + b.amount : a),
                        0
                    ),
                }
            }
        })
        .filter((x) => x !== undefined)
}
