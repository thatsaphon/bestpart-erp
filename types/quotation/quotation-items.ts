import { Prisma } from '@prisma/client'
import { DocumentItem } from '../document-item'
import prisma from '@/app/db/db'

export const getQuotationItemsDefaultFunction = async (
    where: Prisma.QuotationItemWhereInput
) => {
    return await prisma.quotationItem.findMany({
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

export type GetQuotationItems = Awaited<
    ReturnType<typeof getQuotationItemsDefaultFunction>
>[number]

export const quotationItemsToDocumentItems = (
    items: GetQuotationItems[] | undefined
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
                pricePerUnit: item.pricePerUnit,
                quantity: item.quantity,
                quantityPerUnit: item.quantityPerUnit,
                lastPurchaseCostPerUnit:
                    item.GoodsMaster?.lastPurchaseCostPerUnit,
                discountString: item.discountString,
                discountPerUnit: item.discountPerUnit,
                skuMasterId: item.skuMasterId,
                unit: item.unit,
                Image: item.SkuMaster?.Image,
                MainSkuRemark: item.SkuMaster?.MainSku?.MainSkuRemark,
                SkuMasterRemark: item.SkuMaster?.SkuMasterRemark,
                serviceAndNonStockItemId: item.serviceAndNonStockItemId,
            }) as DocumentItem
    )
}
