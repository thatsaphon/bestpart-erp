import { getSalesBill } from './sales-bill'

export type SalesBillItem = {
    id: number
    type: 'Sales' | 'SalesReturn'
    date: Date
    documentId: number
    documentNo: string
    amount: number
}

export const salesBillToSalesBillItems = (
    salesBill: getSalesBill
): SalesBillItem[] => {
    const salesBillItems: SalesBillItem[] = []

    const sales =
        salesBill.SalesBill?.Sales.map((x) => ({
            id: x.id,
            type: 'Sales' as const,
            date: x.Document.date,
            documentId: salesBill.id,
            documentNo: salesBill.documentNo,
            amount: x.SalesItem.reduce(
                (a, b) => a + b.pricePerUnit * b.quantity,
                0
            ),
        })) || []

    const salesReturn =
        salesBill.SalesBill?.SalesReturn.map((x) => ({
            id: x.id,
            type: 'SalesReturn' as const,
            date: x.Document.date,
            documentId: salesBill.id,
            documentNo: salesBill.documentNo,
            amount: -x.SalesReturnItem.reduce(
                (a, b) => a + b.pricePerUnit * b.quantity,
                0
            ),
        })) || []

    salesBillItems.push(...sales, ...salesReturn)

    return salesBillItems
}
