import { Metadata } from 'next'
import prisma from '@/app/db/db'

export const metadata: Metadata = {
    title: 'Inventory',
}

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const contacts = await prisma.contact.findMany({
        where: {
            isAp: true,
        },
    })
    return <>{children}</>
}
