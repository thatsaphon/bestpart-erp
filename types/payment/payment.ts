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
    generalLedger: GetGeneralLedgerIncludeChartOfAccount[] | undefined,
    {
        isCash = true,
        isAr,
        isDeposit,
        isAp,
        isInputTax,
        isOutputTax,
    }: {
        isCash?: boolean
        isAr?: boolean
        isDeposit?: boolean
        isAp?: boolean
        isInputTax?: boolean
        isOutputTax?: boolean
    } = { isCash: true },
    reverseValue?: boolean
) => {
    return (
        generalLedger
            ?.filter(({ ChartOfAccount }) => {
                if (isCash && ChartOfAccount.isCash) return true
                if (isAr && ChartOfAccount.isAr) return true
                if (isDeposit && ChartOfAccount.isDeposit) return true
                if (isAp && ChartOfAccount.isAp) return true
                if (isInputTax && ChartOfAccount.isInputTax) return true
                if (isOutputTax && ChartOfAccount.isOutputTax) return true
                return false
            })
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
                    amount: reverseValue ? -amount : amount,
                    name,
                    isAp,
                    isAr,
                    isCash,
                    isDeposit,
                    isInputTax,
                    isOutputTax,
                })
            ) ||
        [] ||
        []
    )
}
