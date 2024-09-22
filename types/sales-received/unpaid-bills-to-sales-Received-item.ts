import { SalesReceivedItem } from './sales-receive-item'
import { GetUnpaidBills } from './unpaid-bill'

export const unpaidBillsToSalesReceivedItems = (
    unpaidBills: GetUnpaidBills[]
): SalesReceivedItem[] => {
    return unpaidBills
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
            if (x.SalesBill) {
                return {
                    id: x.SalesBill.id,
                    type: 'SalesBill' as const,
                    date: x.date,
                    documentId: x.id,
                    documentNo: x.documentNo,
                    amount:
                        x.SalesBill.Sales.reduce(
                            (a, b) =>
                                a +
                                b.GeneralLedger.reduce(
                                    (a, b) =>
                                        b.ChartOfAccount.isAr
                                            ? a + b.amount
                                            : a,
                                    0
                                ),
                            0
                        ) +
                        x.SalesBill.SalesReturn.reduce(
                            (a, b) =>
                                a +
                                b.GeneralLedger.reduce(
                                    (a, b) =>
                                        b.ChartOfAccount.isAr
                                            ? a + b.amount
                                            : a,
                                    0
                                ),
                            0
                        ),
                }
            }
        })
        .filter((x) => x !== undefined)
}
