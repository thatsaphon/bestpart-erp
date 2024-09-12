import { Route } from '@/types/routes/document-routes'
import { DocumentType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const revalidateDocumentType = async (
    documentType?: DocumentType,
    documentNo?: string
) => {
    let route = ''
    if (!documentType) route = Route.Sales
    if (documentType === DocumentType.Sales) route = Route.Sales
    else if (documentType === DocumentType.SalesReturn)
        route = Route.SalesReturn
    else if (documentType === DocumentType.SalesBill) route = Route.SalesBill
    else if (documentType === DocumentType.SalesReceived)
        route = Route.SalesReceived
    else if (documentType === DocumentType.Purchase) route = Route.Purchase
    else if (documentType === DocumentType.PurchaseReturn)
        route = Route.PurchaseReturn
    else if (documentType === DocumentType.PurchasePayment)
        route = Route.PurchasePayment
    else if (documentType === DocumentType.JournalVoucher)
        route = Route.JournalVoucher
    else if (documentType === DocumentType.Quotation) route = Route.Quotation
    else if (documentType === DocumentType.CustomerOrder)
        route = Route.CustomerOrder
    else if (documentType === DocumentType.PurchaseOrder)
        route = Route.PurchaseOrder
    else if (documentType === DocumentType.OtherInvoice)
        route = Route.OtherInvoice

    revalidatePath(`/sales/${route}`)
    if (documentNo) {
        revalidatePath(`/sales/${route}/${documentNo}`)
        revalidatePath(`/sales/${route}/${documentNo}/edit`)
    }
}
