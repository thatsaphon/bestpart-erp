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
    SkuMovement,
    Image as PrismaImage,
} from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import EditMainSkuDialog from './edit-main-sku-dialog'

type Props = {
    mainSku: MainSku & {
        skuMasters: (SkuMaster & {
            brand?: Brand | null
            carModel?: CarModel | null
            goodsMasters: GoodsMaster[]
            skuMovements?: SkuMovement[]
            images: PrismaImage[]
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
                <CardDescription>{mainSku.partNumber}</CardDescription>
            </CardHeader>
            <CardContent>
                {mainSku.skuMasters.map((skuMaster, index) => (
                    <React.Fragment key={index}>
                        <div className="pb-2">
                            <div className="">{skuMaster?.detail}</div>
                            <div className="text-sm text-muted-foreground">
                                {skuMaster?.remark}
                            </div>
                        </div>
                        <div
                            key={index}
                            className="grid w-full grid-cols-4 items-center gap-4 rounded-md border-b border-t bg-muted px-1 py-1"
                        >
                            {skuMaster.goodsMasters.map(
                                (goodsMaster, index) => (
                                    <React.Fragment key={index}>
                                        <div>
                                            {!!skuMaster.skuMovements
                                                ? skuMaster.skuMovements.reduce(
                                                      (acc, cur) => {
                                                          return (
                                                              acc + cur.quantity
                                                          )
                                                      },
                                                      0
                                                  )
                                                : '?'}
                                        </div>
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
