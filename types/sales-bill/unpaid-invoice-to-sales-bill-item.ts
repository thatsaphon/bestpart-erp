import { SalesBillItem } from './sales-bill-item'
import { getUnpaidInvoice } from './unpaid-invoice'

export const unpaidInvoiceToSalesBillItems = (
    unpaidInvoices: getUnpaidInvoice[]
): SalesBillItem[] => {
    return unpaidInvoices
        .map((x) => {
            if (x.Sales) {
                return {
                    id: x.Sales.id,
                    type: 'Sales' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.Sales.GeneralLedger.reduce(
                        (a, b) => (b.ChartOfAccount.isAr ? a + b.amount : a),
                        0
                    ),
                }
            }
            if (x.SalesReturn) {
                return {
                    id: x.SalesReturn.id,
                    type: 'SalesReturn' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.SalesReturn.GeneralLedger.reduce(
                        (a, b) => (b.ChartOfAccount.isAr ? a + b.amount : a),
                        0
                    ),
                }
            }
        })
        .filter((x) => x !== undefined)
}
