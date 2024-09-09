import { getSalesReceived } from './sales-receive'

export type SalesReceivedItem = {
    id: number
    type: 'Sales' | 'SalesReturn' | 'SalesBill'
    date: Date
    documentId: number
    documentNo: string
    amount: number
}

export const salesReceiveToSalesReceiveItems = (
    salesReceive: getSalesReceived
): SalesReceivedItem[] => {
    const salesBillItems: SalesReceivedItem[] = []

    const sales =
        salesReceive.SalesReceived?.Sales.map((x) => ({
            id: x.id,
            type: 'Sales' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAr ? a + b.amount : a),
                0
            ),
        })) || []

    const salesReturn =
        salesReceive.SalesReceived?.SalesReturn.map((x) => ({
            id: x.id,
            type: 'SalesReturn' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAr ? a + b.amount : a),
                0
            ),
        })) || []

    const salesBill =
        salesReceive.SalesReceived?.SalesBill.map((x) => ({
            id: x.id,
            type: 'SalesBill' as const,
            date: x.Document.date,
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount:
                x.Sales.reduce(
                    (a, b) =>
                        a +
                        b.GeneralLedger.reduce(
                            (a, b) =>
                                b.ChartOfAccount.isAr ? a + b.amount : a,
                            0
                        ),
                    0
                ) +
                x.SalesReturn.reduce(
                    (a, b) =>
                        a +
                        b.GeneralLedger.reduce(
                            (a, b) =>
                                b.ChartOfAccount.isAr ? a + b.amount : a,
                            0
                        ),
                    0
                ),
        })) || []

    salesBillItems.push(...sales, ...salesReturn, ...salesBill)

    return salesBillItems
}
