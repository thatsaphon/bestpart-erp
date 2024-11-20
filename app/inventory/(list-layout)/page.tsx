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
import { PencilIcon } from 'lucide-react'
import Link from 'next/link'

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
    const searchParams = await props.searchParams;
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
                <Accordion type="multiple">
                    {skuTree.items.map((item, index) => (
                        <AccordionItem value={`${item.mainSkuId}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex flex-wrap gap-2">
                                    <p>
                                        {item.name}
                                        <span className="w-[300px] text-primary/50">
                                            {item.partNumber
                                                ? ` - ${item.partNumber}`
                                                : ''}
                                        </span>
                                    </p>
                                    <div className="flex gap-2">
                                        {item.MainSkuRemark.map((remark) => (
                                            <Badge variant={'outline'}>
                                                {remark.remark}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-[1fr_100px_1fr_1fr_1fr] gap-2">
                                    <div>
                                        <Link
                                            href={`/inventory/${item.mainSkuId}`}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Link>
                                    </div>
                                    <div className="text-center">จำนวน</div>
                                    <div>Barcode</div>
                                    <div>หน่วย</div>
                                    <div className="text-right">ราคา</div>
                                    <Separator className="col-span-5" />
                                    {item.SkuMaster.map((sku, index) => (
                                        <React.Fragment
                                            key={`${item.mainSkuId}-${sku.skuMasterId}`}
                                        >
                                            <div className="col-start-1 row-span-2">
                                                <p>
                                                    {sku.detail}{' '}
                                                    <ImageToolTip
                                                        images={sku.Image}
                                                        alt={`${item.name}-${sku.detail}`}
                                                    />{' '}
                                                </p>
                                                {sku.SkuMasterRemark.length >
                                                    0 && (
                                                    <div
                                                        className={'flex gap-2'}
                                                    >
                                                        {sku.SkuMasterRemark.map(
                                                            (remark) => (
                                                                <Badge
                                                                    variant={
                                                                        'outline'
                                                                    }
                                                                >
                                                                    {
                                                                        remark.remark
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {sku.GoodsMaster.map((goods, i) => (
                                                <React.Fragment
                                                    key={`${item.mainSkuId}-${sku.skuMasterId}-${goods.goodsMasterId}`}
                                                >
                                                    <div
                                                        className={cn(
                                                            'col-start-2 text-center'
                                                        )}
                                                    >
                                                        {goods.remaining}
                                                    </div>
                                                    <div>{goods.barcode}</div>
                                                    <div>{`${goods.unit}(${goods.quantityPerUnit})`}</div>
                                                    <div className="text-right">
                                                        {goods.pricePerUnit}
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                            {index !==
                                                item.SkuMaster.length - 1 && (
                                                <Separator className="col-span-5 col-start-1" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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
