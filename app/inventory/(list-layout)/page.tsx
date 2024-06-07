import prisma from '@/app/db/db'
import { InventoryCard } from '@/components/inventory-card'
import PaginationInventory from '../pagination-inventory'

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
        remaining?: 'true' | 'false' | ''
    }
}

export const revalidate = 600
export const dynamic = 'force-dynamic'

export default async function InventoryListPage({
    searchParams,
    searchParams: { page = '1', limit = '10', search = '', remaining = '' },
}: Props) {
    const mainSkus = await prisma.mainSku.findMany({
        where: {
            AND: search
                .split(' ')
                .filter((x) => x)
                .map((x) => ({
                    OR: [
                        { name: { contains: x, mode: 'insensitive' } },
                        { searchKeyword: { contains: x, mode: 'insensitive' } },
                    ],
                })),
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
            CarModel: true,
            SkuMaster: {
                include: {
                    Brand: true,
                    GoodsMaster: true,
                    Image: true,
                    SkuIn: {
                        include: {
                            SkuInToOut: true,
                        },
                    },
                },
            },
        },
    })

    const skuCount = await prisma.mainSku.count({
        where: {
            AND: search
                .split(' ')
                .filter((x) => x)
                .map((x) => ({
                    OR: [
                        { name: { contains: x, mode: 'insensitive' } },
                        { searchKeyword: { contains: x, mode: 'insensitive' } },
                    ],
                })),
        },
    })

    const numberOfPage = Math.ceil(skuCount / Number(limit))

    return (
        <>
            {true && (
                <div className="mt-2 flex flex-wrap gap-3">
                    {mainSkus.map((item, index) => (
                        <InventoryCard key={item.id} mainSku={item} />
                    ))}
                </div>
            )}
            <PaginationInventory
                numberOfPage={numberOfPage}
                searchParams={searchParams}
            />
            {/* <form action={uploadFile}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form> */}
        </>
    )
}
