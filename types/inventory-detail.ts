import { Contact, MainSkuRemark, SkuMasterRemark } from '@prisma/client'

export type InventoryDetailType = {
    mainSkuId: number
    goodsMasterId: number
    barcode: string
    skuMasterId: number
    name: string
    detail: string
    MainSkuRemarks?: MainSkuRemark[]
    SkuMasterRemarks?: SkuMasterRemark[]
    Vendors?: Contact[]
    unit: string
    quantityPerUnit: number
    quantity: number
    price: number
    partNumber: string
    remaining?: number
    images?: string[]
}