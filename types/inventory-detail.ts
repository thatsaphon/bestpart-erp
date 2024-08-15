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
    pricePerUnit: number
    partNumber: string
    remaining?: number
    remainingAt?: Date
    images?: string[]
}

export const defaultInventoryDetail = (): InventoryDetailType => {
    return {
        mainSkuId: 0,
        goodsMasterId: 0,
        barcode: '',
        skuMasterId: 0,
        name: '',
        detail: '',
        MainSkuRemarks: [],
        SkuMasterRemarks: [],
        Vendors: [],
        unit: '',
        quantityPerUnit: 1,
        quantity: 1,
        pricePerUnit: 0,
        partNumber: '',
        remaining: 0,
        images: [],
    }
}
