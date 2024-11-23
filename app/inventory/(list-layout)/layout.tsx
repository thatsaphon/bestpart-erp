import CreateMainSkuDialog from '@/components/create-main-sku-dialog'
import { Metadata } from 'next'
import prisma from '@/app/db/db'
import SearchInventory from './search-inventory-component'

export const metadata: Metadata = {
    title: 'Inventory',
}

export default async function Layout({
    children,
    skuMaster,
}: {
    children: React.ReactNode
    skuMaster: React.ReactNode
}) {
    const contacts = await prisma.contact.findMany({
        where: {
            isAp: true,
        },
    })
    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>สินค้าคงคลัง</span>
                <CreateMainSkuDialog />
            </h1>
            <div className="mt-2 w-full items-center gap-1.5">
                <SearchInventory contacts={contacts} />
            </div>
            <div className="flex gap-4">
                {children}
                {skuMaster}
            </div>
        </div>
    )
}
