'use server'

import prisma from '@/app/db/db'
import { format } from 'date-fns'

export const generateDocumentNumber = async (prefix: string, date: string) => {
    const todayFormat = `${prefix}${format(new Date(date), 'yyyyMM')}`
    const lastInvoice = await prisma.document.findFirst({
        where: { documentId: { contains: todayFormat } },
        orderBy: { documentId: 'desc' },
    })
    if (!lastInvoice || !lastInvoice?.documentId.includes(todayFormat)) {
        return `${todayFormat}001`
    }
    return (
        todayFormat +
        (+lastInvoice.documentId.slice(-3) + 1).toString().padStart(3, '0')
    )
}
