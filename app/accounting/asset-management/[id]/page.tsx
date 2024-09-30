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

type Props = {
    params: { id: string }
}

export default async function AssetDetailPage({ params: { id } }: Props) {
    const asset = await prisma.asset.findUnique({ where: { id: +id } })

    if (!asset) return <>ไม่พบข้อมูล</>
    console.log(asset.acquisitionDate)
    return (
        <div className="p-3">
            <h1 className="text-3xl">จัดการสินทรัพย์</h1>
            <form
                action={async (formData) => {
                    await updateAsset(+id, asset)
                }}
            >
                <div className="mt-3 grid w-[500px] grid-cols-[150px_1fr] items-baseline space-y-2">
                    <div>ชื่อ</div>
                    <Input defaultValue={asset.name} name="name" />
                    <div>รายละเอียด</div>
                    <Textarea
                        defaultValue={asset.description}
                        name="description"
                    />
                    <Label>ประเภท</Label>
                    <Select name="type" defaultValue={asset.type}>
                        <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภทค่าใช้จ่าย" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>ประเภท</SelectLabel>
                                {Object.entries(AssetType).map(
                                    ([key, value]) => (
                                        <SelectItem key={key} value={value}>
                                            {key}
                                        </SelectItem>
                                    )
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div>วันที่</div>
                    <DatePickerWithPresets
                        name="acquisitionDate"
                        defaultDate={asset.acquisitionDate}
                    />
                    <div>มูลค่า</div>
                    <Input
                        defaultValue={String(asset.cost)}
                        name="cost"
                        type="number"
                    />
                    <div>อายุการใช้งาน (ปี)</div>
                    <Input
                        defaultValue={asset.usefulLife || undefined}
                        type="number"
                        name="usefulLife"
                    />
                    <div>มูลค่าซาก</div>
                    <Input
                        defaultValue={asset.residualValue || undefined}
                        type="number"
                        name="residualValue"
                    />
                    <div>หมายเหตุ</div>
                    <Textarea defaultValue={asset.remark} name="remark" />
                    <div className="col-span-2 flex justify-end">
                        <Button>บันทึก</Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
