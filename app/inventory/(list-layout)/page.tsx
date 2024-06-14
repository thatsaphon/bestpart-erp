import { InventoryCard } from '@/components/inventory-card'
import PaginationInventory from '../pagination-inventory'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { searchDistinctMainSku } from './search-distinct-main-sku'
import EditMainSkuDialog from '@/components/edit-main-sku-dialog'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import ImageToolTip from '@/components/image-tooltip'
// import { searchSku } from '@/app/sales/create/search-sku'

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
        remaining?: 'true' | 'false' | ''
        view?: 'card' | 'table'
    }
}

export const revalidate = 600
export const dynamic = 'force-dynamic'

export default async function InventoryListPage({
    searchParams,
    searchParams: {
        page = '1',
        limit = '10',
        search = '',
        remaining = '',
        view = 'card',
    },
}: Props) {
    try {
        const skuList = await searchDistinctMainSku(search, Number(page))

        const numberOfPage = Math.ceil(skuList.count / Number(limit))

        return (
            <>
                {view === 'card' ? (
                    <div className="mt-2 flex flex-wrap gap-3">
                        {skuList.items.map((item, index) => (
                            <InventoryCard key={item[0].name} mainSkus={item} />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableCaption>Table of inventory</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Detail</TableHead>
                                <TableHead>หน่วย</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skuList.items.map((item) => (
                                <TableRow
                                    key={item[0].goodsMasterId}
                                    className="group"
                                >
                                    <TableCell>{item[0].partNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {item[0].name}
                                            <EditMainSkuDialog
                                                mainSkus={item}
                                            />
                                            <ImageToolTip
                                                images={item
                                                    .flatMap((i) => i.images)
                                                    .filter((i) => i)}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {item[0].MainSkuRemarks?.map(
                                                (remark) => (
                                                    <Badge
                                                        key={remark.name}
                                                        variant={'outline'}
                                                        className="text-primary/50 group-hover:text-primary"
                                                    >
                                                        {remark.name}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-primary/50 group-hover:text-primary">
                                        {item.map((goods) => (
                                            <p key={'detail-' + goods.barcode}>
                                                {goods.detail}
                                            </p>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-primary/50 group-hover:text-primary">
                                        {item.map((goods) => (
                                            <p key={'unit-' + goods.barcode}>
                                                {`${goods.unit}`}
                                            </p>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-primary/50 group-hover:text-primary">
                                        {item.map((goods) => (
                                            <p
                                                key={
                                                    'remaining-' + goods.barcode
                                                }
                                            >
                                                {goods.remaining}
                                            </p>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-primary/50 group-hover:text-primary">
                                        {item.map((goods) => (
                                            <p key={'price-' + goods.barcode}>
                                                {goods.price}
                                            </p>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-primary/50 group-hover:text-primary">
                                        {/* <ChevronDown /> */}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <PaginationInventory
                    numberOfPage={numberOfPage}
                    searchParams={searchParams}
                />
            </>
        )
    } catch (error) {
        console.log(error)
        return <>ไม่พบสินค้าที่ต้องการ</>
    }
}
