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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Brand,
    CarModel,
    GoodsMaster,
    MainSku,
    SkuMaster,
} from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import EditMainSkuDialog from './edit-main-sku-dialog'

type Props = {
    mainSku: MainSku & {
        skuMasters: (SkuMaster & {
            brand?: Brand | null
            carModel?: CarModel | null
            goodsMasters: GoodsMaster[]
        })[]
    }
}

export function InventoryCard({ mainSku }: Props) {
    return (
        <Card className="w-[350px] bg-primary-foreground">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{mainSku?.name}</span>
                    <EditMainSkuDialog mainSku={mainSku} />
                </CardTitle>
                {/* <CardDescription>{inventory?.name}</CardDescription> */}
            </CardHeader>
            <CardContent>
                {mainSku.skuMasters.map((skuMaster, index) => (
                    <React.Fragment key={index}>
                        <div
                            key={index}
                            className="grid w-full grid-cols-4 items-center gap-4 border-b py-1"
                        >
                            <div className="border-r">
                                <div className="">{skuMaster?.detail}</div>
                                <div className="text-sm text-muted-foreground">
                                    {skuMaster?.remark}
                                </div>
                            </div>
                            {skuMaster.goodsMasters.map(
                                (goodsMaster, index) => (
                                    <React.Fragment key={index}>
                                        <div className="col-start-2 text-sm">
                                            {goodsMaster?.code}
                                        </div>
                                        <div className="col-start-3 justify-self-end text-sm">
                                            {goodsMaster?.unit}x
                                            {goodsMaster?.quantity}
                                        </div>
                                        <div className="col-start-4 justify-self-end text-sm">
                                            {goodsMaster?.price}
                                        </div>
                                    </React.Fragment>
                                )
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
        </Card>
    )
}
