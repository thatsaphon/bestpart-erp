import Link from 'next/link'
import React from 'react'
import prisma from '@/app/db/db'
import {
    getApPaymentMethods,
    getPaymentMethods,
} from '@/app/actions/accounting'
import CreateUpdateOtherExpenseComponent from '../../create/create-update-other-expense'
import { AccountType, AssetType, DocumentRemark, Prisma } from '@prisma/client'

type Props = {
    params: {
        documentNo: string
    }
}

export default async function UpdateOtherExpensePage({
    params: { documentNo },
}: Props) {
    //PENDING
    const paymentMethods = await getApPaymentMethods()

    const otherExpenses = await prisma.chartOfAccount.findMany({
        where: {
            OR: [
                {
                    type: { in: ['Expense', 'OtherExpense'] },
                },
                {
                    AssetTypeToChartOfAccount: { isNot: null },
                },
            ],
        },
        include: {
            AssetTypeToChartOfAccount: true,
        },
        orderBy: { id: 'asc' },
    })

    const document: {
        id: number
        date: Date
        documentNo: string
        referenceNo?: string
        contactId: number
        contactName: string
        address: string
        phone: string
        taxId: string
        documentRemarks: DocumentRemark[]
        chartOfAccountId: number
        chartOfAccountName: string
        amount: number
        chartOfAccountType: AccountType
        assetName?: string
        assetUsefulLife?: number
        assetResidualValue?: number
        assetType: AssetType | undefined
    }[] = await prisma.$queryRaw`
                    SELECT "Document"."id", "Document"."date", "Document"."documentNo", "Document"."referenceNo", "ApSubledger"."contactId", "Document"."contactName", "Document"."address",
                    "Document"."phone", "Document"."taxId", "ApSubledger"."paymentStatus", "ChartOfAccount"."id" as "chartOfAccountId", "ChartOfAccount"."name" as "chartOfAccountName", 
                    "GeneralLedger"."amount" , "ChartOfAccount"."type" as "chartOfAccountType" ,
                    "Asset"."name" as "assetName", "Asset"."usefulLife" as "assetUsefulLife",
                    "Asset"."residualValue" as "assetResidualValue", "Asset"."type" as "assetType"
                    from "Document"
                    left join "OtherInvoice" on "OtherInvoice"."documentId" = "Document"."id"
                    left join "OtherInvoiceItem" on "OtherInvoice"."id" = "OtherInvoiceItem"."otherInvoiceId"
                    left join "GeneralLedger" on "OtherInvoice"."id" = "GeneralLedger"."otherInvoiceId"

                    -- left join "_DocumentToGeneralLedger" on "Document"."id" = "_DocumentToGeneralLedger"."A"
                    -- left join "GeneralLedger" on "_DocumentToGeneralLedger"."B" = "GeneralLedger"."id"
                    -- left join "ApSubledger" on "ApSubledger"."documentId" = "Document"."id"
                    left join "ChartOfAccount" on "ChartOfAccount"."id" = "GeneralLedger"."chartOfAccountId"
                    left join "AssetMovement" on "OtherInvoiceItem"."id" = "AssetMovement"."otherInvoiceItemId"
                    left join "Asset" on "Asset"."id" = "AssetMovement"."assetId"
                    where 1 = 1
                    and "Document"."documentNo" = ${documentNo}
                    and "ChartOfAccount"."id" not in (${Prisma.join(paymentMethods.map((m) => m.id))})
                    `

    document[0].documentRemarks = await prisma.documentRemark.findMany({
        where: {
            documentId: document[0].id,
        },
    })

    const defaultPayments = await prisma.generalLedger.findMany({
        where: {
            Document: { some: { id: document[0].id } },
            AND: [
                { chartOfAccountId: { in: paymentMethods.map((m) => m.id) } },
                // { chartOfAccountId: { lte: 12000 } },
            ],
        },
        select: {
            chartOfAccountId: true,
            amount: true,
        },
    })

    const defaultRemarks = await prisma.documentRemark.findMany({
        where: { documentId: document[0].id },
    })

    console.log(document)

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/accounting/other-invoice/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-2xl transition-colors">
                บันทึกบิลค่าใช้จ่ายใหม่
            </h1>
            <CreateUpdateOtherExpenseComponent
                chartOfAccounts={otherExpenses}
                paymentMethods={paymentMethods}
                defaultDocumentDetails={document[0]}
                defaultItems={document}
                defaultPayments={defaultPayments.map((x) => ({
                    id: x.chartOfAccountId,
                    amount: -x.amount,
                }))}
                defaultRemarks={defaultRemarks}
            />
        </>
    )
}
