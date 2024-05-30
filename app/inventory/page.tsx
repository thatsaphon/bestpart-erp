import prisma from '@/app/db/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SkuMaster } from '@prisma/client'
import { getInventory } from '@/app/actions/inventory/inventories'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { InventoryCard } from '@/components/inventory-card'
import { headers } from 'next/headers'
import CreateMainSkuDialog from '@/components/create-main-sku-dialog'
import { ListBulletIcon } from '@radix-ui/react-icons'
import { ListIcon } from 'lucide-react'
import Link from 'next/link'
import { createQueryString } from '@/lib/searchParams'
import { uploadFile } from './import-inventory'
import PaginationInventory from './pagination-inventory'
import { redirect } from 'next/navigation'

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
                        { name: { contains: x } },
                        { searchKeyword: { contains: x } },
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

    const skuCount = await prisma.mainSku.count({})

    const numberOfPage = Math.ceil(skuCount / Number(limit))

    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>สินค้าคงคลัง</span>
                <CreateMainSkuDialog />
            </h1>
            <div className="mt-2 grid w-full max-w-sm grid-cols-2 items-center gap-1.5">
                <form
                    action={async (formData) => {
                        'use server'
                        redirect(
                            `?${createQueryString(new URLSearchParams(searchParams), 'search', String(formData.get('search') || ''))}`
                        )
                    }}
                >
                    <Input
                        name="search"
                        type="search"
                        id="search"
                        placeholder="Search"
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </div>
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
            <form action={uploadFile}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form>
        </div>
    )
}
