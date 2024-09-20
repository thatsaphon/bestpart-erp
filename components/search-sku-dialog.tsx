import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { searchSku } from '@/actions/search-sku'
import toast from 'react-hot-toast'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import PaginationClientComponent from '@/components/pagination-client-component'
import { DocumentItem } from '@/types/document-item'
import ImageToolTip from '@/components/image-tooltip'
import { SkuTree } from '@/types/sku-tree/sku-tree'
import { searchSkuTree } from '@/actions/search-sku-tree'
import { searchSkuTreeByKeyword } from '@/actions/search-sku-tree-query'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { PencilIcon } from 'lucide-react'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { ServiceAndNonStockItem } from '@prisma/client'
import prisma from '@/app/db/db'
import { getServiceAndNonStockItemsDefaultFunction } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { nonStockItemToDocumentItem } from '@/types/service-and-non-stock-item/non-stock-to-document-item'

type Props = {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    children?: React.ReactNode
    onSelected: (data: DocumentItem) => void
}

export default function SearchSkuDialog({
    isOpen,
    setIsOpen,
    children,
    onSelected,
}: Props) {
    const [skuTree, setSkuTree] = React.useState<SkuTree>({
        items: [],
        count: 0,
    })
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [page, setPage] = React.useState(1)
    const [count, setCount] = React.useState(0)
    const [serviceAndNonStockItems, setServiceAndNonStockItems] =
        React.useState<ServiceAndNonStockItem[]>([])
    const [selectedNonStockItems, setSelectedNonStockItems] =
        React.useState<ServiceAndNonStockItem>()

    useEffect(() => {
        const fetchData = async () => {
            const data = await getServiceAndNonStockItemsDefaultFunction({
                canSales: true,
            })
            setServiceAndNonStockItems(data)
        }
        fetchData()
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children && <DialogTrigger>{children}</DialogTrigger>}
            <DialogContent className="max-h-[90vh] w-auto min-w-[70vw] max-w-[90vw] overflow-scroll">
                <DialogHeader>
                    <DialogTitle>ค้นหาสินค้า</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="stock">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stock">สินค้า</TabsTrigger>
                        <TabsTrigger value="non-stock">
                            รายการที่ไม่ใช่สินค้า
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="stock">
                        <div className="space-x-2">
                            <Input
                                id="search-sku"
                                placeholder="Search"
                                className="w-[240px]"
                                onChange={(e) =>
                                    setSearchKeyword(e.target.value)
                                }
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        try {
                                            const result =
                                                await searchSkuTreeByKeyword(
                                                    e.currentTarget.value
                                                )
                                            setSkuTree(result)
                                            setCount(result.count)
                                        } catch (error) {
                                            if (error instanceof Error)
                                                return toast.error(
                                                    error.message
                                                )
                                            toast.error('Something went wrong')
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant={'outline'}
                                onClick={async () => {
                                    try {
                                        const result =
                                            await searchSkuTreeByKeyword(
                                                searchKeyword
                                            )
                                        setSkuTree(result)
                                        setCount(result.count)
                                    } catch (error) {
                                        if (error instanceof Error)
                                            return toast.error(error.message)
                                        toast.error('Something went wrong')
                                    }
                                }}
                            >
                                Search
                            </Button>
                        </div>
                        <Accordion type="multiple">
                            {skuTree.items.map((item, index) => (
                                <AccordionItem
                                    value={`${item.mainSkuId}`}
                                    key={index}
                                >
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
                                                {item.MainSkuRemark.map(
                                                    (remark) => (
                                                        <Badge
                                                            variant={'outline'}
                                                        >
                                                            {remark.remark}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Detail
                                                    </TableHead>
                                                    <TableHead>
                                                        Barcode
                                                    </TableHead>
                                                    <TableHead className="text-center">
                                                        จำนวน
                                                    </TableHead>
                                                    <TableHead>หน่วย</TableHead>
                                                    <TableHead className="text-right">
                                                        ราคา
                                                    </TableHead>
                                                    <TableHead className="w-[100px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {item.SkuMaster.map((sku) =>
                                                    sku.GoodsMaster.map(
                                                        (good, index) => (
                                                            <TableRow
                                                                key={
                                                                    good.barcode
                                                                }
                                                            >
                                                                <TableCell>
                                                                    {index ===
                                                                        0 &&
                                                                        sku.detail}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        good.barcode
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {
                                                                        good.remaining
                                                                    }
                                                                </TableCell>
                                                                <TableCell>{`${good.unit}(${good.quantityPerUnit})`}</TableCell>
                                                                <TableCell className="text-right">{`${good.pricePerUnit}`}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        type="button"
                                                                        variant={
                                                                            'outline'
                                                                        }
                                                                        onClick={() =>
                                                                            onSelected(
                                                                                good
                                                                            )
                                                                        }
                                                                    >
                                                                        เลือก
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                        {/* <div className="grid grid-cols-[1fr_100px_1fr_1fr_1fr] gap-2">
                                    <div></div>
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
                                </div> */}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <PaginationClientComponent
                            limit={10}
                            numberOfPage={Math.ceil(count / 10)}
                            onPageClick={async (page: number) => {
                                try {
                                    const result = await searchSkuTreeByKeyword(
                                        searchKeyword,
                                        page
                                    )
                                    setSkuTree(result)
                                    setPage(page)
                                } catch (error) {
                                    toast.error('Something went wrong')
                                }
                            }}
                            page={page}
                        />
                    </TabsContent>
                    <TabsContent value="non-stock">
                        <Select
                            value={String(selectedNonStockItems?.id)}
                            onValueChange={(e) =>
                                setSelectedNonStockItems(
                                    serviceAndNonStockItems.find(
                                        (item) => item.id === Number(e)
                                    ) || serviceAndNonStockItems[0]
                                )
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="เลือกบัญชี" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>เลือกรายการ</SelectLabel>
                                    {serviceAndNonStockItems.map((item) => (
                                        <SelectItem
                                            value={String(item.id)}
                                            key={item.id}
                                        >
                                            {`${item.id} - ${item.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!selectedNonStockItems) {
                                    toast.error('กรุณาเลือกรายการก่อน')
                                    return
                                }
                                onSelected(
                                    nonStockItemToDocumentItem(
                                        selectedNonStockItems
                                    )
                                )
                            }}
                        >
                            เพิ่ม
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
