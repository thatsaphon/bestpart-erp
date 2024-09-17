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
import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { searchSkuTree } from '@/actions/search-sku-tree'
import { SkuTree } from '@/types/sku-tree/sku-tree'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

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
        const skuTree = await searchSkuTree(search, Number(page), {
            createdAt: 'desc',
        })

        const numberOfPage = Math.ceil(skuTree.count / Number(limit))

        return (
            <>
                {view === 'card' ? (
                    <div className="mt-2 flex flex-wrap gap-3">
                        {/* {skuTree.items.map((item, index) => (
                            <InventoryCard key={item[0].name} mainSkus={item} />
                        ))} */}
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-[800px]">
                        {skuTree.items.map((item, index) => (
                            <AccordionItem
                                value={`${item.mainSkuId}`}
                                key={index}
                            >
                                <AccordionTrigger>
                                    <span>
                                        {item.name}
                                        <span className="w-[300px] text-primary/50">
                                            {item.partNumber
                                                ? ` - ${item.partNumber}`
                                                : ''}
                                        </span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-4">
                                        {item.SkuMaster.map((sku) => (
                                            <React.Fragment
                                                key={`${item.mainSkuId}-${sku.skuMasterId}`}
                                            >
                                                <div className="col-start-1 text-lg underline">
                                                    {sku.detail}
                                                </div>
                                                {sku.GoodsMaster.map(
                                                    (goods) => (
                                                        <React.Fragment
                                                            key={`${item.mainSkuId}-${sku.skuMasterId}-${goods.goodsMasterId}`}
                                                        >
                                                            <div className="col-start-1">
                                                                {
                                                                    goods.remaining
                                                                }
                                                            </div>
                                                            <div>
                                                                {goods.barcode}
                                                            </div>
                                                            <div>{`${goods.unit}(${goods.quantityPerUnit})`}</div>
                                                            <div>
                                                                {
                                                                    goods.pricePerUnit
                                                                }
                                                            </div>
                                                        </React.Fragment>
                                                    )
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
