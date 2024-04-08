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

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
    }
}

export const revalidate = 600
export const dynamic = 'force-dynamic'

export default async function InventoryListPage({
    searchParams: { page = '1', limit = '10' },
}: Props) {
    // const page = searchParams.page || 1
    // const limit = searchParams.limit || 10
    // const result = await getInventory(page, limit)
    // await prisma.skuMaster.findMany({
    //   skip:
    //     (Number(page) - 1) *
    //     Number(limit),
    //   take: Number(limit),
    //   include: {
    //     brand: true,
    //     carModel: true,
    //   },
    // })

    const skuCount = await prisma.skuMaster.count({})

    const numberOfPage = Math.ceil(skuCount / Number(limit))

    return (
        <div className="">
            {/* <div className='p-3'>
        <InventoryMenuList />
      </div> */}
            <div className="mb-2 p-3">
                <h1 className="flex items-center gap-2 text-3xl text-primary">
                    <span>สินค้าคงคลัง</span>
                    <CreateMainSkuDialog />
                    {/* <Link
            href={'/inventory/create'}
            className='p-2 bg-green-700 text-white rounded-md text-xl'>
            สร้าง
          </Link> */}
                </h1>
                {/* <p>number: {result.length}</p> */}
                <div className="mt-2 grid w-full max-w-sm items-center gap-1.5">
                    {/* <Label htmlFor='search'>
            Search
          </Label> */}
                    <Input type="search" id="search" placeholder="Search" />
                </div>
                <div className="grid grid-cols-3  gap-2">
                    {/* {result.map((item, index) => (
                        <InventoryCard key={index} inventory={item} />
                    ))} */}
                </div>
                <Pagination className="mt-4">
                    <PaginationContent>
                        {page !== '1' && (
                            <PaginationItem>
                                <PaginationPrevious
                                    href={`?page=${+page - 1}&limit=${limit}`}
                                />
                            </PaginationItem>
                        )}
                        {Array.from({
                            length: numberOfPage,
                        }).map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    isActive={+page === index + 1}
                                    href={`?page=${index + 1}&limit=${limit}`}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        {page !== String(numberOfPage) && (
                            <PaginationItem>
                                <PaginationNext
                                    href={`?page=${+page + 1}&limit=${limit}`}
                                />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
