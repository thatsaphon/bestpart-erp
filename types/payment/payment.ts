import prisma from '@/app/db/db'
import { Prisma } from '@prisma/client'

export type Payment = {
    chartOfAccountId: number
    amount: number
    name?: string
    isCash?: boolean
    isAr?: boolean
    isAp?: boolean
    isDeposit?: boolean
}

export const getGeneralLedgerDefaultFunction = (
    where: Prisma.GeneralLedgerWhereInput
) => {
    return prisma.generalLedger.findMany({
        where,
        include: {
            ChartOfAccount: true,
        },
    })
}

export type GetGeneralLedgerIncludeChartOfAccount = Awaited<
    ReturnType<typeof getGeneralLedgerDefaultFunction>
>[number]

export const generalLedgerToPayments = (
    generalLedger: GetGeneralLedgerIncludeChartOfAccount[],
    includeAr?: boolean
) => {
    return (
        generalLedger
            .filter(
                ({ ChartOfAccount: { isCash, isDeposit, isAr } }) =>
                    isCash || isDeposit || (includeAr && isAr)
            )
            .map(
                ({
                    chartOfAccountId,
                    amount,
                    ChartOfAccount: {
                        name,
                        isAp,
                        isAr,
                        isCash,
                        isDeposit,
                        isInputTax,
                        isOutputTax,
                    },
                }) => ({
                    chartOfAccountId,
                    amount,
                    name,
                    isAp,
                    isAr,
                    isCash,
                    isDeposit,
                    isInputTax,
                    isOutputTax,
                })
            ) || []
    )
}
