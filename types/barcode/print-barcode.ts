import { z } from 'zod'

export const printBarcodeSchema = z.object({
    items: z.array(
        z.object({
            partNumber: z.string().optional(),
            name: z.string().optional(),
            detail: z.string().optional(),
            barcode: z.string().optional(),
            priceCode: z.string().optional(),
            quantity: z.coerce.number().optional(),
        })
    ),
})

export type PrintBarcode = z.infer<typeof printBarcodeSchema>['items']
