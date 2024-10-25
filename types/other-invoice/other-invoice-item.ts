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
    return otherInvoiceItems.map((item) => {
        return {
            serviceAndNonStockItemId: item.serviceAndNonStockItemId,
            name: item.name,
            detail: item.description,
            pricePerUnit: item.isIncludeVat
                ? item.costPerUnitIncVat
                : item.costPerUnitExVat,
            costPerUnitIncVat: item.costPerUnitIncVat,
            costPerUnitExVat: item.costPerUnitExVat,
            discountString: item.discountString,
            discountPerUnitExVat: item.discountPerUnitExVat,
            discountPerUnitIncVat: item.discountPerUnitIncVat,
            vat: item.vat,
            quantity: item.quantity,
            quantityPerUnit: 1,
            unit: item.unit,
            vatable: item.vatable,
            isIncludeVat: item.isIncludeVat,
        } as DocumentItem
    })
}
