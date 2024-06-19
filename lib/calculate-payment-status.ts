
export const calculatePaymentStatus = (payments: { id: number, amount: number }[]) => {
    if (!payments.find((item) => item.id === 12000)) {
        return 'Paid'
    }
    if (payments.length === 1 && payments[0].id === 12000) {
        return 'NotPaid'
    }
    return 'PartialPaid'
}