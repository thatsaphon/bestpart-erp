'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'

export const generateDocumentNumber = async (
    prefix: string,
    date: string | Date
) => {
    const todayFormat = `${prefix}${format(new Date(date), 'yyyyMM')}`
    const lastInvoice = await prisma.document.findFirst({
        where: { documentNo: { startsWith: todayFormat } },
        orderBy: { documentNo: 'desc' },
    })
    if (!lastInvoice || !lastInvoice?.documentNo.includes(todayFormat)) {
        return `${todayFormat}001`
    }
    return (
        todayFormat +
        (+lastInvoice.documentNo.slice(-3) + 1).toString().padStart(3, '0')
    )
}
