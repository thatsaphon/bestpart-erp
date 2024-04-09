'use client'

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
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { InventoryDialog } from './inventory-dialog'
import { SkuFlagSchema } from '@/app/schema/sku-flag-schema'
import { Pencil1Icon } from '@radix-ui/react-icons'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from './ui/dialog'
import { useState } from 'react'
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
    let tags: string[] = []
    const [addingNewSku, setAddingNewSku] = useState(false)
    // const skuFlag = SkuFlagSchema.safeParse(inventory.flag)
    // tags = skuFlag.success && skuFlag.data.tags ? skuFlag.data.tags : []

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{mainSku?.name}</span>
                    {/* Create project */}
                    <EditMainSkuDialog mainSku={mainSku} />
                </CardTitle>
                {/* <CardDescription>{inventory?.name}</CardDescription> */}
            </CardHeader>
            <CardContent>
                {/* <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="gird-cols-[30px_1fr] grid">
                            <Label htmlFor="name">ยี่ห้อ</Label>
                        </div>
                        <div className="gird-cols-[30px_1fr] grid">
                            <Label htmlFor="framework">รุ่นรถ</Label>
                        </div>
                    </div>
                </form> */}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag} variant={'outline'}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}
