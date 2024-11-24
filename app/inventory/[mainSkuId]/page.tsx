import { searchSkuTree } from '@/actions/search-sku-tree'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PencilIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import UpdateMainSkuForm from './update-main-sku-form'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type Props = {
    params: Promise<{
        mainSkuId: string
    }>
}

export default async function MainSkuDetailPage(props: Props) {
    const params = await props.params

    const { mainSkuId } = params

    const {
        items: [skuTree],
        count,
    } = await searchSkuTree({
        id: Number(mainSkuId),
    })

    return (
        <div className="p-3">
            <UpdateMainSkuForm skuTree={skuTree} />
            <Separator className="my-2" />
            <div className="flex w-full flex-col gap-2">
                {skuTree.SkuMaster.map((skuMaster) => (
                    <Card key={`${skuMaster.skuMasterId}`}>
                        <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                            <div>
                                <CardHeader>
                                    <CardTitle>
                                        {skuMaster.detail}
                                        <Link
                                            href={`/inventory/${skuTree.mainSkuId}/${skuMaster.skuMasterId}`}
                                        >
                                            <PencilIcon className="ml-2 inline h-4 w-4" />
                                        </Link>
                                    </CardTitle>
                                    <div>
                                        {skuMaster.SkuMasterRemark.map(
                                            (remark) => (
                                                <Badge
                                                    key={`remark-${skuMaster.skuMasterId}-${remark.remark}`}
                                                    variant={'outline'}
                                                >
                                                    {remark.remark}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                    {skuMaster.position && (
                                        <span>
                                            ตำแหน่งเก็บ: {skuMaster.position}
                                        </span>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>คงเหลือ</TableHead>
                                                <TableHead>Barcode</TableHead>
                                                <TableHead>หน่วย</TableHead>
                                                <TableHead>ราคา</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {skuMaster.GoodsMaster.map(
                                                (goodsMaster) => (
                                                    <TableRow
                                                        key={`goodsMaster-${goodsMaster.goodsMasterId}`}
                                                    >
                                                        <TableCell>
                                                            {
                                                                goodsMaster.remaining
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                goodsMaster.barcode
                                                            }
                                                        </TableCell>
                                                        <TableCell>{`${goodsMaster.unit}(${goodsMaster.quantityPerUnit})`}</TableCell>
                                                        <TableCell>
                                                            {goodsMaster.pricePerUnit.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-3">
                                {skuMaster.Image.map((image) => (
                                    <Image
                                        key={`image-${skuMaster.skuMasterId}-${image}`}
                                        src={image.path}
                                        alt={
                                            skuTree.name +
                                            '-' +
                                            skuMaster.detail
                                        }
                                        className="w-full"
                                        width={300}
                                        height={300}
                                        unoptimized
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
                <Link
                    href={`/inventory/${skuTree.mainSkuId}/create`}
                    className="w-full"
                >
                    <Button type="button">เพิ่มสินค้า</Button>
                </Link>
            </div>
        </div>
    )
}
