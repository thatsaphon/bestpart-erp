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
            documentId: x.Document.id,
            documentNo: x.Document.documentNo,
            amount: x.GeneralLedger.reduce(
                (a, b) => (b.ChartOfAccount.isAr ? a + b.amount : a),
                0
            ),
        })) || []

    const salesReturn =
        salesBill.SalesBill?.SalesReturn.map((x) => ({
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

    salesBillItems.push(...sales, ...salesReturn)

    return salesBillItems
}
