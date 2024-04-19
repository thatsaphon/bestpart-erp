'use client'

import React, { useState } from 'react'
import { Input } from './ui/input'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Label } from './ui/label'
import { Pencil1Icon, Pencil2Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import {
    MainSku,
    SkuMaster,
    Brand,
    CarModel,
    GoodsMaster,
    Image as PrismaImage,
} from '@prisma/client'
import { createInventory } from '@/app/actions/inventory/inventories'
import toast from 'react-hot-toast'
import SkuMasterCardForm from './sku-master-card-form'
import { editMainSku } from '@/app/actions/inventory/editMainSku'
import InventoryDialogContextMenu from './inventory-dialog-context-menu'

type Props = {
    mainSku: MainSku & {
        skuMasters: (SkuMaster & {
            brand?: Brand | null
            carModel?: CarModel | null
            goodsMasters: GoodsMaster[]
            images: PrismaImage[]
        })[]
    }
}

export default function EditMainSkuDialog({ mainSku }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [addingNewSku, setAddingNewSku] = useState(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(bool) => {
                setIsOpen(bool)
                setAddingNewSku(false)
                setIsEdit(false)
            }}
        >
            <DialogTrigger asChild>
                <Pencil2Icon className="ml-2 inline h-4 w-4 hover:cursor-pointer" />
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-scroll">
                <DialogHeader className="">
                    <form
                        action={async (formData) => {
                            const result = await editMainSku(formData)
                            if (result.error) {
                                return toast.error(result.error)
                            }
                            setIsEdit(false)
                            toast.success('Main SKU edited')
                        }}
                    >
                        <input
                            type="text"
                            name="id"
                            hidden
                            defaultValue={mainSku.id}
                        />
                        {isEdit ? (
                            <Input
                                defaultValue={mainSku?.name}
                                name="name"
                                className="inline w-auto"
                            />
                        ) : (
                            mainSku?.name
                        )}
                        {isEdit && (
                            <Button
                                type="submit"
                                className="ml-2"
                                variant={'secondary'}
                            >
                                Save
                            </Button>
                        )}
                        {!isEdit && (
                            <Pencil1Icon
                                onClick={() => setIsEdit(true)}
                                className="-mt-1 ml-2 inline h-4 w-4 hover:cursor-pointer"
                            />
                        )}
                        {/* <Button
                            variant={'ghost'}
                            className="ml-2 px-2"
                            type={isEdit ? 'submit' : 'button'}
                            onClick={() => {
                                if (!isEdit) setIsEdit(true)
                            }}
                        >
                        </Button> */}

                        {isEdit ? (
                            <Input
                                defaultValue={mainSku?.partNumber || ''}
                                name="partNumber"
                                className="inline w-auto"
                            />
                        ) : (
                            <div>
                                <DialogDescription>
                                    {mainSku?.partNumber}
                                </DialogDescription>
                            </div>
                        )}
                    </form>
                </DialogHeader>
                <div className="flex min-h-[400px] flex-col gap-2">
                    {mainSku.skuMasters.length > 0 &&
                        mainSku.skuMasters.map((skuMaster, index) => (
                            <InventoryDialogContextMenu
                                key={skuMaster.id}
                                skuMaster={skuMaster}
                            >
                                <SkuMasterCardForm skuMaster={skuMaster} />
                            </InventoryDialogContextMenu>
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
