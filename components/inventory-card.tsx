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
import { ImageIcon } from '@radix-ui/react-icons'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'
import Image from 'next/image'

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
                <CardDescription>
                    {mainSkus[0].MainSkuRemarks?.map((remark) => (
                        <Badge key={remark.name} variant={'outline'}>
                            {remark.name}
                        </Badge>
                    ))}
                </CardDescription>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <CardDescription>
                                <ImageIcon className="h-4 w-4" />
                            </CardDescription>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="grid w-[650px] grid-cols-3 gap-2 pb-2">
                                {mainSkus.map((mainSku, index) => (
                                    <React.Fragment key={index}>
                                        {mainSku.images?.map((image) => (
                                            <Image
                                                src={image}
                                                alt={mainSku.name}
                                                key={image}
                                                unoptimized
                                                width={500}
                                                height={500}
                                            />
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent>
                {mainSkus.map((mainSku, index) =>
                    mainSku.skuMasterId ? (
                        <React.Fragment key={index}>
                            <div className="pb-2">
                                <div className="">{mainSku?.detail}</div>
                                <div className="text-sm text-muted-foreground">
                                    {mainSku.SkuMasterRemarks?.map((remark) => (
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
                                className="grid w-full grid-cols-4 items-center gap-4 rounded-md border-b border-t bg-muted px-1 py-1"
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
                                        {mainSku.price}
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
