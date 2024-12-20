import prisma from '@/app/db/db'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AssetType } from '@prisma/client'
import { Label } from '@radix-ui/react-dropdown-menu'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
} from '@/components/ui/select'
import React from 'react'
import { Button } from '@/components/ui/button'
import { updateAsset } from './update-asset'
import AssetUpdateForm from './asset-update-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AssetMovement from './asset-movement'
import { getAssetDefaultFunction } from '@/types/asset/asset'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ id: string }>
}

export default async function AssetDetailPage(props: Props) {
    const params = await props.params;

    const {
        id
    } = params;

    const [asset] = await getAssetDefaultFunction({ id: +id })

    if (!asset) return notFound()

    return (
        <div className="p-3">
            <h1 className="text-3xl">จัดการสินทรัพย์</h1>
            <Tabs className="mt-3" defaultValue="movement">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="detail">Detail</TabsTrigger>
                    <TabsTrigger value="movement">Movement</TabsTrigger>
                </TabsList>
                <TabsContent value="detail">
                    <AssetUpdateForm asset={asset} />
                </TabsContent>
                <TabsContent value="movement">
                    <AssetMovement asset={asset} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
