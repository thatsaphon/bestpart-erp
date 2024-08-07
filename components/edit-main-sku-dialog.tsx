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
import { createInventory } from '@/app/actions/inventory/inventories'
import toast from 'react-hot-toast'
import SkuMasterCardForm from './sku-master-card-form'
import { editMainSku } from '@/app/actions/inventory/editMainSku'
import InventoryDialogContextMenu from './inventory-dialog-context-menu'
import { InventoryDetailType } from '@/types/inventory-detail'
import {
    disconnectMainSkuRemark,
    upsertMainSkuRemark,
} from '@/app/inventory/remark-action/main-sku-remark'
import { Badge } from './ui/badge'
import { Trash2Icon } from 'lucide-react'
import AddMainSkuRemarkInput from './add-main-sku-remark-input'

type Props = {
    mainSkus: InventoryDetailType[]
}

export default function EditMainSkuDialog({ mainSkus }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [addingNewSku, setAddingNewSku] = useState(false)

    function groupBySkuMasters(mainSkus: InventoryDetailType[]) {
        const groups: { [key: string]: InventoryDetailType[] } = {}
        mainSkus.forEach((mainSku) => {
            if (!groups[mainSku.skuMasterId]) {
                groups[mainSku.skuMasterId] = []
            }
            groups[mainSku.skuMasterId].push(mainSku)
        })
        return groups
    }

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
                            defaultValue={mainSkus[0].mainSkuId}
                            readOnly
                        />
                        {isEdit ? (
                            <Input
                                defaultValue={mainSkus[0].name}
                                name="name"
                                className="inline w-auto"
                            />
                        ) : (
                            mainSkus[0].name
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
                                defaultValue={mainSkus[0].partNumber || ''}
                                name="partNumber"
                                className="inline w-auto"
                            />
                        ) : (
                            <div>
                                <DialogDescription>
                                    {mainSkus[0].partNumber}
                                </DialogDescription>
                            </div>
                        )}
                    </form>
                    <div className="flex flex-wrap items-center">
                        {mainSkus[0].MainSkuRemarks?.map((remark) => (
                            <Badge key={remark.id} variant={'secondary'}>
                                {remark.name}{' '}
                                <Trash2Icon
                                    className="ml-1 h-4 w-4"
                                    onClick={async () => {
                                        try {
                                            await disconnectMainSkuRemark(
                                                remark.id,
                                                mainSkus[0].mainSkuId
                                            )
                                            toast.success('Remark updated')
                                        } catch (err) {
                                            if (err instanceof Error)
                                                return toast.error(err.message)
                                            toast.error('Something went wrong')
                                        }
                                    }}
                                />
                            </Badge>
                        ))}
                        <AddMainSkuRemarkInput
                            mainSku={mainSkus[0].mainSkuId}
                        />
                    </div>
                </DialogHeader>
                <div className="flex min-h-[400px] flex-col gap-2">
                    {Object.entries(groupBySkuMasters(mainSkus)).map(
                        ([skuMasterId, skuMasters]) =>
                            skuMasters[0].skuMasterId ? (
                                <InventoryDialogContextMenu key={skuMasterId}>
                                    <SkuMasterCardForm skuDetail={skuMasters} />
                                </InventoryDialogContextMenu>
                            ) : (
                                <></>
                            )
                    )}
                    {!addingNewSku && (
                        <Button onClick={() => setAddingNewSku(true)}>
                            Add new SKU
                        </Button>
                    )}
                    {addingNewSku && (
                        <form
                            action={async (formData) => {
                                if (formData.get('detail') === '') {
                                    return toast.error('Detail cannot be empty')
                                }
                                try {
                                    const result =
                                        await createInventory(formData)
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
                                defaultValue={mainSkus[0].mainSkuId}
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
