'use server'

import prisma from '@/app/db/db'

export const generateBarcode = async () => {
    while (1) {
        const barcode = (Math.random() * 10 ** 12).toFixed(0).padStart(12, '0')
        const checkDigit = checkDigitEAN13(barcode)
        const result = await prisma.goodsMaster.findUnique({
            where: {
                barcode: barcode + checkDigit,
            },
        })
        if (!result) return barcode
    }
}

function checkDigitEAN13(barcode: string) {
    const sum = barcode
        .split('')
        .map((n, i) => +n * (i % 2 ? 3 : 1)) // alternate between multiplying with 3 and 1
        .reduce((sum, n) => sum + n, 0) // sum all values

    const roundedUp = Math.ceil(sum / 10) * 10 // round sum to nearest 10

    const checkDigit = roundedUp - sum // subtract round to sum = check digit

    return checkDigit
}
