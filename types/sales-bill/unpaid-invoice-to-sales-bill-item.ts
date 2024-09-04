import { SalesBillItem } from './sales-bill-item'
import { getUnpaidInvoice } from './unpaid-invoice'

export const unpaidInvoiceToSalesBillItems = (
    unpaidInvoices: getUnpaidInvoice[]
): SalesBillItem[] => {
    return unpaidInvoices
        .map((x) => {
            if (x.Sales) {
                return {
                    id: 0,
                    type: 'Sales' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: x.Sales.SalesItem.reduce(
                        (a, b) => a + b.pricePerUnit * b.quantity,
                        0
                    ),
                }
            }
            if (x.SalesReturn) {
                return {
                    id: 0,
                    type: 'SalesReturn' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount: -x.SalesReturn.SalesReturnItem.reduce(
                        (a, b) => a + b.pricePerUnit * b.quantity,
                        0
                    ),
                }
            }
        })
        .filter((x) => x !== undefined)
}
