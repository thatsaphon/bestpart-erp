export type InventoryDetailType = {
    id: number
    goodsMasterId: number
    barcode: string
    skuMasterId: number
    name: string
    detail: string
    remark: string
    unit: string
    quantityPerUnit: number
    quantity: number
    price: number
    partNumber: string
    remaining?: number
    images?: string[]
}