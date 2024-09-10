import { Prisma } from '@prisma/client'
import { DocumentItem } from '../document-item'
import prisma from '@/app/db/db'

export const getSalesItemsDefaultFunction = async (
    where: Prisma.CustomerOrderItemWhereInput
) => {
    return await prisma.customerOrderItem.findMany({
        where: where,
    })
}

export type GetCustomerOrderItems = Awaited<
    ReturnType<typeof getSalesItemsDefaultFunction>
>[number]

export const salesItemsToDocumentItems = (
    items: GetCustomerOrderItems[] | undefined
) => {
    if (!items) return []
    return items.map(
        (item) =>
            ({
                barcode: item.barcode,
                detail: '',
                name: item.description,
                pricePerUnit: item.pricePerUnit,
                quantity: item.quantity,
                quantityPerUnit: item.quantityPerUnit,
                unit: item.unit,
                Image: [],
                MainSkuRemark: [],
                SkuMasterRemark: [],
            }) as DocumentItem
    )
}
