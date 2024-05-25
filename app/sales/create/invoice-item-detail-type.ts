export type InvoiceItemDetailType = {
    goodsMasterId: number
    barcode: string
    skuMasterId: number
    name: string
    detail: string
    unit: string
    quantityPerUnit: number
    quantity: number
    price: number
    partNumber: string
    remaining?: number
}