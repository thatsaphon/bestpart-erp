import { SubRoute } from '@/types/routes/document-routes'
import { DocumentType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const revalidateDocumentType = async (
    documentType?: DocumentType,
    documentNo?: string
) => {
    let route = ''
    if (!documentType) route = SubRoute.Sales
    if (documentType === DocumentType.Sales) route = SubRoute.Sales
    else if (documentType === DocumentType.SalesReturn)
        route = SubRoute.SalesReturn
    else if (documentType === DocumentType.SalesBill) route = SubRoute.SalesBill
    else if (documentType === DocumentType.SalesReceived)
        route = SubRoute.SalesReceived
    else if (documentType === DocumentType.Purchase) route = SubRoute.Purchase
    else if (documentType === DocumentType.PurchaseReturn)
        route = SubRoute.PurchaseReturn
    else if (documentType === DocumentType.PurchasePayment)
        route = SubRoute.PurchasePayment
    else if (documentType === DocumentType.JournalVoucher)
        route = SubRoute.JournalVoucher
    else if (documentType === DocumentType.Quotation) route = SubRoute.Quotation
    else if (documentType === DocumentType.CustomerOrder)
        route = SubRoute.CustomerOrder
    else if (documentType === DocumentType.PurchaseOrder)
        route = SubRoute.PurchaseOrder
    else if (documentType === DocumentType.OtherInvoice)
        route = SubRoute.OtherInvoice

    revalidatePath(`/sales/${route}`)
    if (documentNo) {
        revalidatePath(`/sales/${route}/${documentNo}`)
        revalidatePath(`/sales/${route}/${documentNo}/edit`)
    }
}
