'use client'

import React, { Fragment, useEffect, useState } from 'react'
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
import SkuMasterCardForm from './sku-master-card-form'

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
                <Pencil1Icon className="ml-2 inline h-4 w-4 hover:cursor-pointer" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>{mainSku?.name}</DialogHeader>
                <div className="flex min-h-[400px] flex-col gap-2">
                    {mainSku.skuMasters.length > 0 &&
                        mainSku.skuMasters.map((skuMaster, index) => (
                            <SkuMasterCardForm
                                key={index}
                                skuMaster={skuMaster}
                            />
                        ))}
                    {!addingNewSku && (
                        <Button onClick={() => setAddingNewSku(true)}>
                            Add new SKU
                        </Button>
                    )}
                    {addingNewSku && (
                        <form
                            action={async (formData) => {
                                try {
                                    const result =
                                        await createInventory(formData)
                                    console.log(result)
                                    if (result.message === 'error')
                                        return toast.error('fail')

                                    toast.success('success')
                                    setAddingNewSku(false)
                                } catch (err) {
                                    console.error(err)
                                    toast.error('fail')
                                }
                            }}
                        >
                            <input
                                type="text"
                                name="mainSkuId"
                                defaultValue={mainSku?.id}
                                className="hidden"
                            />
                            <div className="grid w-full items-center gap-4">
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <Label
                                        className="pr-2 text-right"
                                        htmlFor="detail"
                                    >
                                        รายละเอียด
                                    </Label>
                                    <Input id="detail" name="detail" />
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
                            </div>
                            <Button type="submit">Create</Button>
                        </form>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'secondary'}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
