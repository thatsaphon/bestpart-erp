'use server'

import prisma from '@/app/db/db'
import { DocumentType } from '@prisma/client'

export default async function getChartOfAccountDetail(id: number) {
    const documents: {
        documentNo: string
        type: DocumentType
        amount: number
    }[] =
        await prisma.$queryRaw`select "Document"."documentNo","Document"."type", "GeneralLedger"."amount" from "ChartOfAccount"
                            left join "GeneralLedger" on "ChartOfAccount"."id" = "GeneralLedger"."chartOfAccountId"
                            left join "_DocumentToGeneralLedger" on "_DocumentToGeneralLedger"."B" = "GeneralLedger"."id"
                            left join "Document" on "_DocumentToGeneralLedger"."A" = "Document"."id"
                            where "ChartOfAccount"."id" = ${id} 
                            `
    return documents
}
