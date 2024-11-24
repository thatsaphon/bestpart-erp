import PaginationInventory from '../pagination-inventory'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import ImageToolTip from '@/components/image-tooltip'
import { searchSkuTreeByKeyword } from '@/actions/search-sku-tree-query'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PencilIcon, Share, Share2, SquareChartGantt } from 'lucide-react'
import Link from 'next/link'
import {
    TableHeader,
    TableRow,
    Table,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { createQueryString } from '@/lib/searchParams'

type Props = {
    searchParams: Promise<{
        page?: string
        limit?: string
        search?: string
        remaining?: 'true' | 'false' | ''
        view?: 'card' | 'table'
    }>
}

export const revalidate = 600
export const dynamic = 'force-dynamic'

export default async function InventoryListPage(props: Props) {
    const searchParams = await props.searchParams
    const {
        page = '1',
        limit = '10',
        search = '',
        remaining = '',
        view = 'card',
    } = await searchParams
    try {
        const skuTree = await searchSkuTreeByKeyword(search, Number(page), {
            createdAt: 'desc',
        })

        const numberOfPage = Math.ceil(skuTree.count / Number(limit))

        return (
            <div className="w-[800px] space-y-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Number</TableHead>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {skuTree.items.map((item) => (
                            <React.Fragment key={item.mainSkuId}>
                                <TableRow>
                                    <TableCell>{item.partNumber}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="flex gap-1">
                                        <Link
                                            href={`/inventory/${item.mainSkuId}`}
                                        >
                                            <PencilIcon
                                                className="h-5 w-5"
                                                strokeWidth={1}
                                            />
                                        </Link>
                                        <Link
                                            href={`?${createQueryString(new URLSearchParams(searchParams), 'mainSkuId', String(item.mainSkuId))}`}
                                        >
                                            <SquareChartGantt
                                                className="h-5 w-5"
                                                strokeWidth={1}
                                            />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
                <PaginationInventory
                    numberOfPage={numberOfPage}
                    searchParams={await searchParams}
                />
            </div>
        )
    } catch (error) {
        console.log(error)
        return <>ไม่พบสินค้าที่ต้องการ</>
    }
}
