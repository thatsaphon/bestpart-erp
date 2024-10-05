'use server'

import prisma from '@/app/db/db'
import { MainSkuRemark, Prisma, SkuMasterRemark } from '@prisma/client'
import { DocumentItem } from '@/types/document-item'
import { checkRemaining } from './check-remaining'

export const searchSkuTreeDetail = async (
    where: Prisma.MainSkuWhereInput,
    skuMasterWhere: Prisma.SkuMasterWhereInput,
    page: number = 1,
    orderBy: Prisma.MainSkuOrderByWithRelationInput = { name: 'asc' }
) => {
    const items = await prisma.mainSku.findMany({
        where,
        include: {
            SkuMaster: {
                where: skuMasterWhere,
                include: {
                    GoodsMaster: {
                        include: {
                            PurchaseItem: {
                                include: {
                                    Purchase: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            PurchaseOrderItem: {
                                include: {
                                    PurchaseOrder: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            PurchaseReturnItem: {
                                include: {
                                    PurchaseReturn: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            QuotationItem: {
                                include: {
                                    Quotation: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            SalesItem: {
                                include: {
                                    Sales: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            SalesReturnItem: {
                                include: {
                                    SalesReturn: {
                                        include: {
                                            Contact: true,
                                            Document: true,
                                        },
                                    },
                                },
                            },
                            StockAdjustmentItem: {
                                include: {
                                    StockAdjustment: {
                                        include: {
                                            Document: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    Image: true,
                    SkuMasterRemark: true,
                    MainSku: true,
                    PurchaseOrderItem: {
                        include: {
                            PurchaseOrder: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    PurchaseReturnItem: {
                        include: {
                            PurchaseReturn: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    QuotationItem: {
                        include: {
                            Quotation: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    SalesItem: {
                        include: {
                            Sales: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    SalesReturnItem: {
                        include: {
                            SalesReturn: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    PurchaseItem: {
                        include: {
                            Purchase: {
                                include: {
                                    Contact: true,
                                    Document: true,
                                },
                            },
                        },
                    },
                    StockAdjustmentItem: {
                        include: {
                            StockAdjustment: {
                                include: {
                                    Document: true,
                                },
                            },
                        },
                    },
                },
            },
            MainSkuRemark: true,
        },
        skip: (page - 1) * 10,
        take: 10,
        orderBy: { name: 'asc' },
    })
    const count = await prisma.mainSku.count({
        where,
    })

    const remaining = await checkRemaining(
        items.flatMap((item) => item.SkuMaster).map((i) => i.id)
    )

    return {
        items: items.map((mainSku) => ({
            mainSkuId: mainSku.id,
            partNumber: mainSku.partNumber || '',
            name: mainSku.name,
            MainSkuRemark: mainSku.MainSkuRemark,
            SkuMaster: mainSku.SkuMaster.map((sku) => ({
                skuMasterId: sku.id,
                detail: sku.detail,
                position: sku.position,
                SkuMasterRemark: sku.SkuMasterRemark,
                Image: sku.Image,
                MainSku: sku.MainSku,
                PurchaseOrderItem: sku.PurchaseOrderItem,
                PurchaseReturnItem: sku.PurchaseReturnItem,
                QuotationItem: sku.QuotationItem,
                SalesItem: sku.SalesItem,
                SalesReturnItem: sku.SalesReturnItem,
                PurchaseItem: sku.PurchaseItem,
                StockAdjustmentItem: sku.StockAdjustmentItem,
                GoodsMaster: sku.GoodsMaster.map((goods) => ({
                    mainSkuId: mainSku.id,
                    goodsMasterId: goods.id,
                    barcode: goods.barcode,
                    skuMasterId: goods.skuMasterId,
                    name: mainSku.name,
                    detail: sku.detail,
                    unit: goods.unit,
                    quantityPerUnit: goods.quantityPerUnit,
                    quantity: 0,
                    pricePerUnit: goods.pricePerUnit,
                    partNumber: mainSku.partNumber || '',
                    remaining:
                        (remaining.find(
                            (r) => r.skuMasterId === goods.skuMasterId
                        )?.remaining || 0) / goods.quantityPerUnit,
                    Image: sku.Image,
                    MainSkuRemark: mainSku.MainSkuRemark,
                    SkuMasterRemark: sku.SkuMasterRemark,
                })) as DocumentItem[],
            })),
        })),
        count,
    }
}
