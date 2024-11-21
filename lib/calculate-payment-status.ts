export const calculateArPaymentStatus = (
    payments: { id: number; amount: number }[]
) => {
    if (!payments.find((item) => item.id === 12000)) {
        return 'Paid'
    }
    if (payments.length === 1 && payments[0].id === 12000) {
        return 'NotPaid'
    }
    return 'PartialPaid'
}

export const calculateApPaymentStatus = (
    payments: { id: number; amount: number }[]
) => {
    if (!payments.find((item) => item.id === 21000 || item.id === 22100)) {
        return 'Paid'
    }
    if (
        payments.length === 1 &&
        (payments[0].id === 21000 || payments[0].id === 22100)
    ) {
        return 'NotPaid'
    }
    return 'PartialPaid'
}
