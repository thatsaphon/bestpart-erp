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

type Props = {
    params: { id: string }
}

export default async function AssetDetailPage({ params: { id } }: Props) {
    const asset = await prisma.asset.findUnique({ where: { id: +id } })

    if (!asset) return <>ไม่พบข้อมูล</>

    return (
        <div className="p-3">
            <h1 className="text-3xl">จัดการสินทรัพย์</h1>
            <Tabs className="mt-3" defaultValue="detail">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="detail">Detail</TabsTrigger>
                    <TabsTrigger value="movement">Movement</TabsTrigger>
                </TabsList>
                <TabsContent value="detail">
                    <AssetUpdateForm asset={asset} />
                </TabsContent>
                <TabsContent value="movement"></TabsContent>
            </Tabs>
        </div>
    )
}
