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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
                <form
                    action={async (formData) => {
                        'use server'
                        redirect(
                            `?${createQueryString(new URLSearchParams(searchParams), 'search', String(formData.get('search') || ''))}`
                        )
                    }}
                >
                    <div className="flex w-full flex-wrap gap-2 ">
                        <Input
                            name="search"
                            type="search"
                            id="search"
                            placeholder="Search"
                            className="w-auto max-w-sm"
                        />
                        <Select>
                            <SelectTrigger className="w-[200px] max-w-xs">
                                <SelectValue placeholder="ผู้ขาย" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>ผู้ขาย</SelectLabel>
                                    {contacts.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.name}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button type="submit">Submit</Button>
                    </div>
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
            {/* <form action={uploadFile}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form> */}
        </div>
    )
}
