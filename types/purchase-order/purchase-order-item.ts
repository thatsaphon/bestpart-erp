import prisma from '@/app/db/db'
import {
    GoodsMaster,
    Prisma,
    ServiceAndNonStockItem,
    SkuMaster,
} from '@prisma/client'
import { DocumentItem } from '../document-item'

export const getPurchaseOrderItemsDefaultFunction = async (
    where: Prisma.PurchaseOrderItemWhereInput
) => {
    return await prisma.purchaseOrderItem.findMany({
        where: where,
        include: {
            SkuMaster: {
                include: {
                    MainSku: {
                        include: {
                            MainSkuRemark: true,
                        },
                    },
                    SkuMasterRemark: true,
                    Image: true,
                },
            },
            GoodsMaster: true,
            ServiceAndNonStockItem: {
                include: {
                    ChartOfAccount: true,
                },
            },
        },
    })
}

export type GetPurchaseOrderItems = Awaited<
    ReturnType<typeof getPurchaseOrderItemsDefaultFunction>
>[number]

export const purchaseOrderItemsToDocumentItems = (
    items: GetPurchaseOrderItems[] | undefined
) => {
    if (!items) return []
    return items.map(
        (item) =>
            ({
                barcode: item.barcode,
                detail: item.SkuMaster?.detail,
                name: item.SkuMaster?.MainSku?.name,
                goodsMasterId: item.goodsMasterId,
                mainSkuId: item.SkuMaster?.mainSkuId,
                partNumber: item.SkuMaster?.MainSku?.partNumber,
                pricePerUnit: item.costPerUnit,
                quantity: item.quantity,
                quantityPerUnit: item.quantityPerUnit,
                skuMasterId: item.skuMasterId,
                unit: item.unit,
                Image: item.SkuMaster?.Image,
                MainSkuRemark: item.SkuMaster?.MainSku?.MainSkuRemark,
                SkuMasterRemark: item.SkuMaster?.SkuMasterRemark,
                serviceAndNonStockItemId: item.serviceAndNonStockItemId,
            }) as DocumentItem
    )
}
