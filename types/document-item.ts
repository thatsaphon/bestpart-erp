import {
    Contact,
    MainSkuRemark,
    SkuMasterImage,
    SkuMasterRemark,
} from '@prisma/client'

export type DocumentItem = {
    mainSkuId?: number
    goodsMasterId?: number
    skuMasterId?: number
    barcode?: string
    serviceAndNonStockItemId?: number
    name: string
    detail: string
    MainSkuRemark: MainSkuRemark[]
    SkuMasterRemark: SkuMasterRemark[]
    Vendors?: Contact[]
    unit: string
    quantityPerUnit: number
    quantity: number
    lastPurchaseCostPerUnit?: number | null
    pricePerUnit: number
    costPerUnitIncVat?: number
    costPerUnitExVat?: number
    vat?: number
    partNumber?: string
    remaining?: number
    remainingAt?: Date
    Image: SkuMasterImage[]
    vatable?: boolean
    isIncludeVat?: boolean
}

export const defaultInventoryDetail = (): DocumentItem => {
    return {
        mainSkuId: 0,
        goodsMasterId: 0,
        barcode: '',
        skuMasterId: 0,
        name: '',
        detail: '',
        MainSkuRemark: [],
        SkuMasterRemark: [],
        Vendors: [],
        unit: '',
        quantityPerUnit: 1,
        quantity: 1,
        pricePerUnit: 0,
        partNumber: '',
        remaining: 0,
        Image: [],
        vatable: true,
        isIncludeVat: true,
    }
}
