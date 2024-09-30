'use client'

import React, { useEffect } from 'react'
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { AssetType, Prisma } from '@prisma/client'
import { shortDateFormat } from '@/lib/date-format'
import { createAsset } from './create-asset'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { DatePickerWithPresetsState } from '@/components/date-picker-preset-state'

type Props = {}

export default function CreateAssetDialog({}: Props) {
    const [open, setOpen] = React.useState(false)
    const [assetDetail, setAssetDetail] =
        React.useState<Prisma.AssetCreateInput>({
            name: '',
            acquisitionDate: new Date(),
            description: '',
            cost: 0,
            remark: '',
            type: AssetType.Buildings,
            residualValue: undefined,
            usefulLife: undefined,
        })
    const [date, setDate] = React.useState(new Date())

    useEffect(() => {
        setAssetDetail({ ...assetDetail, acquisitionDate: date })
    }, [date])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button">สร้างสินทรัพย์ใหม่</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>สร้างสินทรัพย์ใหม่</DialogTitle>
                </DialogHeader>
                <form
                    action={async () => {
                        await createAsset(assetDetail)
                    }}
                >
                    <div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Name</Label>
                            <Input
                                type="text"
                                className="col-span-1"
                                value={assetDetail.name}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Description</Label>
                            <Textarea
                                className="col-span-1"
                                value={assetDetail.description}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Type</Label>
                            <Select
                                value={assetDetail.type}
                                onValueChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        type: e as AssetType,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภทค่าใช้จ่าย" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>ประเภท</SelectLabel>
                                        {Object.entries(AssetType).map(
                                            ([key, value]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={value}
                                                >
                                                    {key}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Acquisition Date</Label>
                            <DatePickerWithPresetsState
                                date={date}
                                setDate={setDate}
                            />
                            {/* <Input
                                type="date"
                                className="col-span-1"
                                value={shortDateFormat(
                                    new Date(assetDetail.acquisitionDate)
                                )}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        acquisitionDate: new Date(
                                            e.target.value
                                        ),
                                    })
                                }
                            /> */}
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Useful Life</Label>
                            <Input
                                type="number"
                                className="col-span-1"
                                value={assetDetail.usefulLife || undefined}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        usefulLife: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Cost</Label>
                            <Input
                                type="number"
                                className="col-span-1"
                                value={assetDetail.cost || undefined}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        cost: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Residual Value</Label>
                            <Input
                                type="number"
                                className="col-span-1"
                                value={assetDetail.residualValue}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        residualValue: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="mb-1 grid grid-cols-1 gap-2">
                            <Label>Remark</Label>
                            <Textarea
                                className="col-span-1"
                                value={assetDetail.remark}
                                onChange={(e) =>
                                    setAssetDetail({
                                        ...assetDetail,
                                        remark: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-2">
                        <Button type="submit">Submit</Button>
                        <DialogClose asChild>
                            <Button variant={'outline'} type="button">
                                ยกเลิก
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
