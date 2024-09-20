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

type Props = {
    params: {
        mainSkuId: string
    }
}

export default async function MainSkuDetailPage({
    params: { mainSkuId },
}: Props) {
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
                        <CardHeader>
                            <CardTitle>
                                {skuMaster.detail}
                                <Link
                                    href={`/inventory/${skuTree.mainSkuId}/${skuMaster.skuMasterId}`}
                                >
                                    <PencilIcon className="ml-2 inline h-4 w-4" />
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                {skuMaster.SkuMasterRemark.map((remark) => (
                                    <Badge
                                        key={`remark-${skuMaster.skuMasterId}-${remark.remark}`}
                                        variant={'outline'}
                                    >
                                        {remark.remark}
                                    </Badge>
                                ))}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                                <div className="grid grid-cols-[80px_1fr_1fr_1fr] place-content-start gap-2 rounded-md border-2 border-dashed p-4">
                                    <div className="text-center">คงเหลือ</div>
                                    <div>Barcode</div>
                                    <div>หน่วย</div>
                                    <div className="text-right">ราคา</div>
                                    {skuMaster.GoodsMaster.map(
                                        (goodsMaster) => (
                                            <React.Fragment
                                                key={`goodsMaster-${goodsMaster.goodsMasterId}`}
                                            >
                                                <div className="text-center">
                                                    {goodsMaster.remaining}
                                                </div>
                                                <div>{goodsMaster.barcode}</div>
                                                <div>{`${goodsMaster.unit}(${goodsMaster.quantityPerUnit})`}</div>
                                                <div className="text-right">
                                                    {goodsMaster.pricePerUnit.toLocaleString()}
                                                </div>
                                            </React.Fragment>
                                        )
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
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
                        </CardContent>
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
