import prisma from '@/app/db/db'
import {
    GoodsMaster,
    Prisma,
    ServiceAndNonStockItem,
    SkuMaster,
} from '@prisma/client'
import { DocumentItem } from '../document-item'

export const getSalesReturnItemsDefaultFunction = async (
    where: Prisma.SalesReturnItemWhereInput
) => {
    return await prisma.salesReturnItem.findMany({
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

export type GetSalesReturnItems = Awaited<
    ReturnType<typeof getSalesReturnItemsDefaultFunction>
>[number]

export const getDefaultSalesReturnItem = () => {
    return {
        id: 0,
        quantity: 0,
        quantityPerUnit: 0,
        barcode: '',
        description: '',
        createdAt: new Date(),
        GoodsMaster: {
            barcode: '',
            createdAt: new Date(),
            id: 0,
            pricePerUnit: 0,
            quantityPerUnit: 0,
            skuMasterId: 0,
            unit: '',
            updatedAt: new Date(),
        },
        name: '',
        pricePerUnit: 0,
        unit: '',
        SkuMaster: {
            canNegative: false,
            createdAt: new Date(),
            detail: '',
            id: 0,
            Image: [],
            mainSkuId: 0,
            MainSku: {
                partNumber: '',
                id: 0,
                name: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                MainSkuRemark: [],
                searchKeyword: '',
            },
            SkuMasterRemark: [],
            updatedAt: new Date(),
        },

        vat: 0,
        updatedAt: new Date(),
        salesId: 0,
        ServiceAndNonStockItem: {
            ChartOfAccount: {
                createdAt: new Date(),
                id: 0,
                isAp: false,
                isAr: false,
                isCash: false,
                isInputTax: false,
                isOutputTax: false,
                name: '',
                type: 'Revenue',
                updatedAt: new Date(),
            },
            canOtherInvoice: false,
            id: 0,
            canPurchase: false,
            canSales: false,
            chartOfAccountId: 0,
        },
        goodsMasterId: null,
        serviceAndNonStockItemId: null,
        skuMasterId: null,
    }
}

export const salesReturnItemsToDocumentItems = (
    items: GetSalesReturnItems[] | undefined
) => {
    if (!items) return []
    return items.map(
        (item) =>
            ({
                barcode: item.barcode,
                detail: item.SkuMaster?.detail,
                name:
                    item.SkuMaster?.MainSku?.name ||
                    item.ServiceAndNonStockItem?.name,
                goodsMasterId: item.goodsMasterId,
                mainSkuId: item.SkuMaster?.mainSkuId,
                position: item.SkuMaster?.position,
                partNumber: item.SkuMaster?.MainSku?.partNumber,
                pricePerUnit: item.pricePerUnit,
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
