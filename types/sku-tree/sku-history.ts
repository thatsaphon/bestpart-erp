import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import { Contact, DocumentType } from '@prisma/client'

export type SkuMasterHistory = {
    skuMasterId: number
    goodsMasterId: number
    documentId: number
    documentNo: string
    documentType: DocumentType
    date: Date
    Contact: Contact
    costPerUnitIncVat?: number
    costPerUnitExVat?: number
    pricePerUnit?: number
    quantity: number
    quantityPerUnit: number
    unit: string
}

export function getSkuMasterHistory(
    data: Awaited<
        ReturnType<typeof searchSkuTreeDetail>
    >['items'][0]['SkuMaster'][0]
) {
    const histories: SkuMasterHistory[] = []
    const purchaseItems = data.PurchaseItem.map(
        ({
            Purchase: {
                Contact,
                Document: {
                    date,
                    documentNo,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            costPerUnitIncVat,
            costPerUnitExVat,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                Contact,
                costPerUnitIncVat,
                costPerUnitExVat,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const purchaseReturnItems = data.PurchaseReturnItem.map(
        ({
            PurchaseReturn: {
                Contact,
                Document: {
                    date,
                    documentNo,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            costPerUnitIncVat,
            costPerUnitExVat,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                Contact,
                costPerUnitIncVat,
                costPerUnitExVat,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const purchaseOrderItems = data.PurchaseOrderItem.map(
        ({
            PurchaseOrder,
            goodsMasterId,
            skuMasterId,
            costPerUnitIncVat,
            costPerUnitExVat,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId: PurchaseOrder?.Document.id,
                documentNo: PurchaseOrder?.Document.documentNo,
                documentType: PurchaseOrder?.Document.type,
                date: PurchaseOrder?.Document.date,
                Contact: PurchaseOrder?.Contact,
                costPerUnitIncVat,
                costPerUnitExVat,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const quotationItems = data.QuotationItem.map(
        ({
            Quotation: {
                Contact,
                Document: {
                    documentNo,
                    date,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            pricePerUnit,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                Contact,
                pricePerUnit,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const salesItems = data.SalesItem.map(
        ({
            Sales: {
                Contact,
                Document: {
                    documentNo,
                    date,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            pricePerUnit,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                Contact,
                pricePerUnit,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const salesReturnItems = data.SalesReturnItem.map(
        ({
            SalesReturn: {
                Contact,
                Document: {
                    documentNo,
                    date,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            pricePerUnit,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                Contact,
                pricePerUnit,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )
    const stockAdjustmentItems = data.StockAdjustmentItem.map(
        ({
            StockAdjustment: {
                Document: {
                    documentNo,
                    date,
                    id: documentId,
                    type: documentType,
                },
            },
            goodsMasterId,
            skuMasterId,
            estimatedCost,
            quantity,
            quantityPerUnit,
            unit,
        }) =>
            ({
                skuMasterId,
                goodsMasterId,
                documentId,
                documentNo,
                documentType,
                date,
                costPerUnitIncVat: estimatedCost,
                costPerUnitExVat: estimatedCost,
                quantity,
                quantityPerUnit,
                unit,
            }) as SkuMasterHistory
    )

    histories.push(
        ...purchaseItems,
        ...purchaseReturnItems,
        ...purchaseOrderItems,
        ...quotationItems,
        ...salesItems,
        ...salesReturnItems,
        ...stockAdjustmentItems
    )
    return histories.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
}
