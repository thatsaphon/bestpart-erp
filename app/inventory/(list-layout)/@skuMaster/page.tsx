import { searchSkuTree } from '@/actions/search-sku-tree'
import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@radix-ui/react-dropdown-menu'
import React from 'react'

type Props = {
    searchParams: Awaited<{
        mainSkuId: string
    }>
}

export default async function Page(props: Props) {
    const { mainSkuId } = await props.searchParams
    if (!mainSkuId) return <></>
    const skuTree = await searchSkuTree({
        id: Number(mainSkuId),
    })
    if (!skuTree || skuTree.count === 0) return <>ไม่พบข้อมูล</>
    const sku = skuTree.items[0]
    return (
        <div>
            <h1 className="text-3xl">{sku.name}</h1>
            <h2 className="text-primary">{sku.partNumber}</h2>
            <h2 className="flex gap-2 text-primary">
                {sku.MainSkuRemark.map((remark) => (
                    <Badge key={remark.remark} variant={'outline'}>
                        {remark.remark}
                    </Badge>
                ))}
            </h2>
            <Separator className="my-2" />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>รายละเอียด</TableHead>
                        <TableHead>คงเหลือ</TableHead>
                        <TableHead>หน่วย</TableHead>
                        <TableHead className="text-right">ราคา</TableHead>
                        <TableHead>ตำแหน่งเก็บ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sku.SkuMaster.flatMap((skuMaster) =>
                        skuMaster.GoodsMaster.map((goodsMaster, goodsIndex) => (
                            <React.Fragment
                                key={`${skuMaster.skuMasterId}-${goodsMaster.goodsMasterId}`}
                            >
                                <TableRow>
                                    <TableCell>
                                        {goodsIndex === 0 && skuMaster.detail}
                                    </TableCell>
                                    <TableCell>
                                        {goodsMaster.remaining}
                                    </TableCell>
                                    <TableCell>
                                        {`${goodsMaster.unit}(${goodsMaster.quantityPerUnit})`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {goodsMaster.pricePerUnit.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {goodsIndex === 0 && skuMaster.position}
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
