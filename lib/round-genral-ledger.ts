'use server'

// round genral ledgers
// chart of account id of Rounding = 72000
export const roundAndRemoveZeroGenralLedgers = (
    genralLedgers: {
        chartOfAccountId: number
        amount: number
    }[]
) => {
    const total = genralLedgers.reduce((acc, gl) => acc + gl.amount, 0)
    return [
        ...genralLedgers.filter((gl) => gl.amount === 0),
        { chartOfAccountId: 72000, amount: -total },
    ]
}
