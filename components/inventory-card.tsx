import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { InventoryDetailType } from '@/types/inventory-detail'
import EditMainSkuDialog from './edit-main-sku-dialog'
import { Badge } from './ui/badge'
import ImageToolTip from './image-tooltip'

type Props = {
    mainSkus: InventoryDetailType[]
}

export function InventoryCard({ mainSkus }: Props) {
    return (
        <Card className="w-[500px] bg-primary-foreground">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{mainSkus[0].name}</span>
                    <EditMainSkuDialog mainSkus={mainSkus} />
                </CardTitle>
                <CardDescription>{mainSkus[0].partNumber}</CardDescription>
                <div className="flex flex-wrap gap-1">
                    {mainSkus[0].MainSkuRemark?.map((remark) => (
                        <Badge key={remark.name} variant={'outline'}>
                            {remark.name}
                        </Badge>
                    ))}
                </div>
                <ImageToolTip
                    images={
                        mainSkus
                            .flatMap((i) => i.Image)
                            .filter((i) => i) as string[]
                    }
                />
            </CardHeader>
            <CardContent>
                {mainSkus.map((mainSku, index) =>
                    mainSku.skuMasterId ? (
                        <React.Fragment key={index}>
                            <div className="pb-2">
                                <div className="flex items-center gap-1">
                                    {mainSku?.detail}

                                    {!!mainSku.Vendors?.length && (
                                        <Badge variant={'outline'}>
                                            {mainSku.Vendors?.map(
                                                (vendor) => vendor.name
                                            )}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {mainSku.SkuMasterRemark?.map((remark) => (
                                        <Badge
                                            key={remark.name}
                                            variant={'outline'}
                                        >
                                            {remark.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div
                                key={index}
                                className="mb-2 grid w-full grid-cols-4 items-center gap-4 rounded-md border-b border-t bg-muted px-1 py-1"
                            >
                                <React.Fragment key={index}>
                                    <div>{mainSku.remaining}</div>
                                    <div className="col-start-2 text-sm">
                                        {mainSku.barcode}
                                    </div>
                                    <div className="col-start-3 justify-self-end text-sm">
                                        {mainSku.unit}({mainSku.quantityPerUnit}
                                        )
                                    </div>
                                    <div className="col-start-4 justify-self-end text-sm">
                                        {mainSku.pricePerUnit}
                                    </div>
                                </React.Fragment>
                            </div>
                        </React.Fragment>
                    ) : (
                        <></>
                    )
                )}
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
        </Card>
    )
}
