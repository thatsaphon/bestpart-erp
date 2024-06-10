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

type Props = {
    mainSkus: InventoryDetailType[]
}

export function InventoryCard({ mainSkus }: Props) {
    return (
        <Card className="w-[350px] bg-primary-foreground">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{mainSkus[0].name}</span>
                    <EditMainSkuDialog mainSkus={mainSkus} />
                </CardTitle>
                <CardDescription>{mainSkus[0].partNumber}</CardDescription>
            </CardHeader>
            <CardContent>
                {mainSkus.map((mainSku, index) => (
                    <React.Fragment key={index}>
                        <div className="pb-2">
                            <div className="">{mainSku?.detail}</div>
                            <div className="text-sm text-muted-foreground">
                                {mainSku.remark}
                            </div>
                        </div>
                        <div
                            key={index}
                            className="grid w-full grid-cols-4 items-center gap-4 rounded-md border-b border-t bg-muted px-1 py-1"
                        >
                            <React.Fragment key={index}>
                                <div>{mainSku.remaining}</div>
                                <div className="col-start-2 text-sm">
                                    {mainSku.barcode}
                                </div>
                                <div className="col-start-3 justify-self-end text-sm">
                                    {mainSku.unit}({mainSku.quantityPerUnit})
                                </div>
                                <div className="col-start-4 justify-self-end text-sm">
                                    {mainSku.price}
                                </div>
                            </React.Fragment>
                        </div>
                    </React.Fragment>
                ))}
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
        </Card>
    )
}
