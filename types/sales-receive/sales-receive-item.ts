import { getSalesReceive } from './sales-receive'

export type SalesReceiveItem = {
    id: number
    type: 'Sales' | 'SalesReturn' | 'SalesBill'
    date: Date
    documentId: number
    documentNo: string
    amount: number
}

export const salesReceiveToSalesReceiveItems = (
    salesReceive: getSalesReceive
): SalesReceiveItem[] => {
    const salesBillItems: SalesReceiveItem[] = []

    const sales =
        salesReceive.SalesReceived?.Sales.map((x) => ({
            id: x.id,
            type: 'Sales' as const,
            date: x.Document.date,
            documentId: salesReceive.id,
            documentNo: salesReceive.documentNo,
            amount: x.SalesItem.reduce(
                (a, b) => a + b.pricePerUnit * b.quantity,
                0
            ),
        })) || []

    const salesReturn =
        salesReceive.SalesReceived?.SalesReturn.map((x) => ({
            id: x.id,
            type: 'SalesReturn' as const,
            date: x.Document.date,
            documentId: salesReceive.id,
            documentNo: salesReceive.documentNo,
            amount: -x.SalesReturnItem.reduce(
                (a, b) => a + b.pricePerUnit * b.quantity,
                0
            ),
        })) || []

    const salesBill =
        salesReceive.SalesReceived?.SalesBill.map((x) => ({
            id: x.id,
            type: 'SalesBill' as const,
            date: x.Document.date,
            documentId: salesReceive.id,
            documentNo: salesReceive.documentNo,
            amount:
                x.Sales.reduce(
                    (a, b) =>
                        a +
                        b.SalesItem.reduce(
                            (a, b) => a + b.pricePerUnit * b.quantity,
                            0
                        ),
                    0
                ) +
                -x.SalesReturn.reduce(
                    (a, b) =>
                        a +
                        b.SalesReturnItem.reduce(
                            (a, b) => a + b.pricePerUnit * b.quantity,
                            0
                        ),
                    0
                ),
        })) || []

    salesBillItems.push(...sales, ...salesReturn, ...salesBill)

    return salesBillItems
}
