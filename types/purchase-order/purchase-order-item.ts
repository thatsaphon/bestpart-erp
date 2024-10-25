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
                position: item.SkuMaster?.position,
                partNumber: item.SkuMaster?.MainSku?.partNumber,
                pricePerUnit: item.isIncludeVat
                    ? item.costPerUnitIncVat
                    : item.costPerUnitExVat,
                costPerUnitExVat: item.costPerUnitExVat,
                costPerUnitIncVat: item.costPerUnitIncVat,
                lastPurchaseCostPerUnit:
                    item.GoodsMaster?.lastPurchaseCostPerUnit,
                discountString: item.discountString,
                discountPerUnitExVat: item.discountPerUnitExVat,
                discountPerUnitIncVat: item.discountPerUnitIncVat,
                vat: item.vat,
                quantity: item.quantity,
                quantityPerUnit: item.quantityPerUnit,
                skuMasterId: item.skuMasterId,
                unit: item.unit,
                Image: item.SkuMaster?.Image,
                MainSkuRemark: item.SkuMaster?.MainSku?.MainSkuRemark,
                SkuMasterRemark: item.SkuMaster?.SkuMasterRemark,
                serviceAndNonStockItemId: item.serviceAndNonStockItemId,
                vatable: item.vatable,
                isIncludeVat: item.isIncludeVat,
            }) as DocumentItem
    )
}
