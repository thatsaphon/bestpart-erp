'use server'

import prisma from '@/app/db/db'

export const getChartOfAccountHistory = async (
    chartOfAccountId: number,
    page: number = 1
) => {
    if (!page) page = 1
    const documents = await prisma.$queryRaw<
        {
            documentNo: string
            id: number
            date: Date
            type: string
            amount: number
        }[]
    >`
        select "Document"."id", "Document"."documentNo", "Document"."date", "Document"."type", "GeneralLedger"."amount" from "Document"
        left join "Sales" on "Document"."id" = "Sales"."documentId"
        left join "SalesReturn" on "Document"."id" = "SalesReturn"."documentId"
        left join "Purchase" on "Document"."id" = "Purchase"."documentId"
        left join "PurchaseReturn" on "Document"."id" = "PurchaseReturn"."documentId"
        left join "SalesReceived" on "Document"."id" = "SalesReceived"."documentId"
        left join "JournalVoucher" on "Document"."id" = "JournalVoucher"."documentId"
        left join "OtherInvoice" on "Document"."id" = "OtherInvoice"."documentId"
        left join "OtherPayment" on "Document"."id" = "OtherPayment"."documentId"
        left join "PurchasePayment" on "Document"."id" = "PurchasePayment"."documentId"
        left join "CustomerOrder" on "Document"."id" = "CustomerOrder"."documentId"
        left join "GeneralLedger" on "Sales"."id" = "GeneralLedger"."salesId"
            or "SalesReturn"."id" = "GeneralLedger"."salesReturnId"
            or "Purchase"."id" = "GeneralLedger"."purchaseId"
            or "PurchaseReturn"."id" = "GeneralLedger"."purchaseReturnId"
            or "SalesReceived"."id" = "GeneralLedger"."salesReceivedId"
            or "JournalVoucher"."id" = "GeneralLedger"."journalVoucherId"
            or "OtherInvoice"."id" = "GeneralLedger"."otherInvoiceId"
            or "OtherPayment"."id" = "GeneralLedger"."otherPaymentId"
            or "PurchasePayment"."id" = "GeneralLedger"."purchasePaymentId"
            or "CustomerOrder"."id" = "GeneralLedger"."customerOrderId"
        where "GeneralLedger"."chartOfAccountId" = ${chartOfAccountId}
        order by "Document"."date" desc
        limit ${50}
        offset ${page * 50 - 50}
    `
    const count = await prisma.$queryRaw<
        {
            count: number
        }[]
    >`
        select count("Document"."id") from "Document"
        left join "Sales" on "Document"."id" = "Sales"."documentId"
        left join "SalesReturn" on "Document"."id" = "SalesReturn"."documentId"
        left join "Purchase" on "Document"."id" = "Purchase"."documentId"
        left join "PurchaseReturn" on "Document"."id" = "PurchaseReturn"."documentId"
        left join "SalesReceived" on "Document"."id" = "SalesReceived"."documentId"
        left join "JournalVoucher" on "Document"."id" = "JournalVoucher"."documentId"
        left join "OtherInvoice" on "Document"."id" = "OtherInvoice"."documentId"
        left join "OtherPayment" on "Document"."id" = "OtherPayment"."documentId"
        left join "PurchasePayment" on "Document"."id" = "PurchasePayment"."documentId"
        left join "CustomerOrder" on "Document"."id" = "CustomerOrder"."documentId"
        left join "GeneralLedger" on "Sales"."id" = "GeneralLedger"."salesId"
            or "SalesReturn"."id" = "GeneralLedger"."salesReturnId"
            or "Purchase"."id" = "GeneralLedger"."purchaseId"
            or "PurchaseReturn"."id" = "GeneralLedger"."purchaseReturnId"
            or "SalesReceived"."id" = "GeneralLedger"."salesReceivedId"
            or "JournalVoucher"."id" = "GeneralLedger"."journalVoucherId"
            or "OtherInvoice"."id" = "GeneralLedger"."otherInvoiceId"
            or "OtherPayment"."id" = "GeneralLedger"."otherPaymentId"
            or "PurchasePayment"."id" = "GeneralLedger"."purchasePaymentId"
            or "CustomerOrder"."id" = "GeneralLedger"."customerOrderId"
        where "GeneralLedger"."chartOfAccountId" = ${chartOfAccountId}
    `

    return { items: documents, count: Number(count[0].count) }

    // const chartOfAccount = await prisma.chartOfAccount.findUnique({
    //     where: {
    //         id: chartOfAccountId,
    //     },
    //     include: {
    //         GeneralLedger: {
    //             include: {
    //                 CustomerOrder: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 Sales: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 Purchase: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 SalesReturn: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 PurchaseReturn: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 SalesReceived: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 JournalVoucher: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 OtherInvoice: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 OtherPayment: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //                 PurchasePayment: {
    //                     include: {
    //                         Document: true,
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // })
    // if (!chartOfAccount) return []
    // return chartOfAccount.GeneralLedger.map((generalLedger) => {
    //     return {
    //         ...generalLedger,
    //         Document:
    //             generalLedger.CustomerOrder?.Document ||
    //             generalLedger.JournalVoucher?.Document ||
    //             generalLedger.OtherInvoice?.Document ||
    //             generalLedger.OtherPayment?.Document ||
    //             generalLedger.PurchasePayment?.Document ||
    //             generalLedger.Purchase?.Document ||
    //             generalLedger.PurchaseReturn?.Document ||
    //             generalLedger.Sales?.Document ||
    //             generalLedger.SalesReceived?.Document ||
    //             generalLedger.SalesReturn?.Document,
    //     }
    // }).sort((a, b) => b.Document!.date.getTime() - a.Document!.date.getTime())
    // const history = await prisma.document.findMany({
    //     where: {

    //     }
    // })
}
