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
import Image from 'next/image'
import React from 'react'

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
            <h1 className="text-3xl">{skuTree.name}</h1>
            <h2 className="text-primary">{skuTree.partNumber}</h2>
            <h2 className="flex gap-2 text-primary">
                {skuTree.MainSkuRemark.map((remark) => (
                    <Badge key={remark.name} variant={'outline'}>
                        {remark.name}
                    </Badge>
                ))}
            </h2>
            <Separator className="my-2" />
            <div className="flex w-full flex-col gap-2">
                {skuTree.SkuMaster.map((skuMaster) => (
                    <Card key={`${skuMaster.skuMasterId}`}>
                        <CardHeader>
                            <CardTitle>{skuMaster.detail}</CardTitle>
                            <CardDescription>
                                {skuMaster.SkuMasterRemark.map((remark) => (
                                    <Badge
                                        key={`remark-${skuMaster.skuMasterId}-${remark.name}`}
                                        variant={'outline'}
                                    >
                                        {remark.name}
                                    </Badge>
                                ))}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                                <div className="grid grid-cols-4 gap-2 border-b-2 p-4">
                                    <div className="text-center">จำนวน</div>
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
                                                <div>{`${goodsMaster.unit}(${goodsMaster.unit})`}</div>
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
            </div>
        </div>
    )
}
