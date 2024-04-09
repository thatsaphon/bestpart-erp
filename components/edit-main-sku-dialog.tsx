'use client'

import React, { useState } from 'react'
import { Input } from './ui/input'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from './ui/dialog'
import { Label } from './ui/label'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import {
    MainSku,
    SkuMaster,
    Brand,
    CarModel,
    GoodsMaster,
} from '@prisma/client'
import { createInventory } from '@/app/actions/inventory/inventories'
import toast from 'react-hot-toast'

type Props = {
    mainSku: MainSku & {
        skuMasters: (SkuMaster & {
            brand?: Brand | null
            carModel?: CarModel | null
            goodsMasters: GoodsMaster[]
        })[]
    }
}

export default function EditMainSkuDialog({ mainSku }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [addingNewSku, setAddingNewSku] = useState(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(bool) => {
                setIsOpen(bool)
                setAddingNewSku(false)
            }}
        >
            <DialogTrigger asChild>
                <Pencil1Icon className="ml-2 inline h-4 w-4" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>{mainSku?.name}</DialogHeader>
                {!addingNewSku && (
                    <Button onClick={() => setAddingNewSku(true)}>
                        Add new SKU
                    </Button>
                )}
                {addingNewSku && (
                    <form
                        action={async (formData) => {
                            try {
                                const result = await createInventory(formData)
                                console.log(result)
                                // setAddingNewSku(false)
                            } catch (err) {
                                console.error(err)
                                toast.error('fail')
                            }
                        }}
                    >
                        <div className="grid w-full items-center gap-4">
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <Label
                                    className="pr-2 text-right"
                                    htmlFor="name"
                                >
                                    รายละเอียด
                                </Label>
                                <Input id="name" name="name" />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <Label
                                    className="pr-2 text-right"
                                    htmlFor="brand"
                                >
                                    รุ่นรถ
                                </Label>
                                <Input id="brand" name="brand" />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <Label
                                    className="pr-2 text-right"
                                    htmlFor="remark"
                                >
                                    หมายเหตุ
                                </Label>
                                <Input id="remark" name="remark" />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <Label
                                    className="pr-2 text-right"
                                    htmlFor="vendor"
                                >
                                    ผู้ขาย
                                </Label>
                                <Input
                                    id="vendor"
                                    name="vendor"
                                    placeholder="ยังไม่พร้อมใช้งาน"
                                    disabled
                                />
                            </div>
                        </div>
                        <Button type="submit">Create</Button>
                    </form>
                )}
                <DialogFooter>
                    <DialogClose>
                        <Button variant={'secondary'}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
