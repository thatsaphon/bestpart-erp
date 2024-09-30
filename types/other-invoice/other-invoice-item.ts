import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'
import { DocumentItem } from '../document-item'

export const getOtherInvoiceItemsDefaultFunction = async (
    where: Prisma.OtherInvoiceItemWhereInput
) => {
    return await prisma.otherInvoiceItem.findMany({
        where,
        include: {
            ServiceAndNonStockItem: true,
        },
    })
}

export type GetOtherInvoiceItem = Awaited<
    ReturnType<typeof getOtherInvoiceItemsDefaultFunction>
>[number]

export const otherInvoiceItemToDocumentItem = (
    otherInvoiceItems?: GetOtherInvoiceItem[]
): DocumentItem[] => {
    if (otherInvoiceItems === undefined) return []
    return otherInvoiceItems.map((otherInvoiceItem) => {
        return {
            serviceAndNonStockItemId: otherInvoiceItem.serviceAndNonStockItemId,
            name: otherInvoiceItem.name,
            detail: otherInvoiceItem.description,
            pricePerUnit: otherInvoiceItem.costPerUnit,
            quantity: otherInvoiceItem.quantity,
            quantityPerUnit: 1,
            unit: otherInvoiceItem.unit,
            vatable: otherInvoiceItem.vatable,
        } as DocumentItem
    })
}
