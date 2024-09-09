export type Payment = {
    chartOfAccountId: number
    amount: number
    name: string
    isCash?: boolean
    isAr?: boolean
    isAp?: boolean
    isDeposit?: boolean
}
