import { PurchasePaymentItem } from './purchase-payment-item'
import { GetUnpaidPurchase } from './unpaid-purchase'

export const unpaidPurchaseToPurchasePaymentItems = (
    unpaidPurchases: GetUnpaidPurchase[]
): PurchasePaymentItem[] => {
    return unpaidPurchases
        .map((x) => {
            if (x.Purchase) {
                return {
                    id: x.Purchase.id,
                    type: 'PurchaseReceived' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.Purchase.GeneralLedger.reduce(
                        (a, b) => (b.ChartOfAccount.isAp ? a + b.amount : a),
                        0
                    ),
                }
            }
            if (x.PurchaseReturn) {
                return {
                    id: x.PurchaseReturn.id,
                    type: 'PurchaseReturn' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.PurchaseReturn.GeneralLedger.reduce(
                        (a, b) => (b.ChartOfAccount.isAp ? a + b.amount : a),
                        0
                    ),
                }
            }
        })
        .filter((x) => x !== undefined)
}
