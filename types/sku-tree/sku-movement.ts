'use server'

import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import prisma from '@/app/db/db'
import { Contact, DocumentType, Prisma } from '@prisma/client'

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

export async function getSkuMovement(where: Prisma.StockMovementWhereInput) {
    return await prisma.stockMovement.findMany({
        where,
        include: {
            Contact: true,
            Document: true,
            SkuMaster: true,
        },
    })
}
