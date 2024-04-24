'use client'
import {
    createInventory,
    editInventory,
} from '@/app/actions/inventory/inventories'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Fragment, useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from './ui/separator'
import { Tooltip } from 'react-tooltip'
import { Brand, CarModel, SkuMaster } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { SkuFlagSchema } from '@/app/schema/sku-flag-schema'
import { cn } from '@/lib/utils'

type Props = {
    inventory?: SkuMaster & {
        brand?: Brand | null
        carModel?: CarModel | null
    }
    label?: string
    mode?: 'create' | 'edit'
    isButton?: boolean
}

export function InventoryDialog({
    inventory,
    label = 'สร้างสินค้าหลัก',
    mode = 'create',
    isButton = true,
}: Props) {
    const skuFlag = SkuFlagSchema.safeParse(inventory?.flag)
    const [tags, setTags] = useState<string[]>(
        skuFlag.success && skuFlag.data.tags ? skuFlag.data.tags : []
    )

    const tagInputRef = useRef<HTMLInputElement>(null)

    const onAddTag = () => {
        if (!tagInputRef.current) return
        if (!tagInputRef.current.value.trim()) return

        setTags((prev) => [...prev, tagInputRef.current?.value as string])
        tagInputRef.current.value = ''
    }

    const onDeleteTag = (index: number) => {
        setTags((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                {isButton ? (
                    <Button variant="outline" type="button">
                        {label}
                    </Button>
                ) : (
                    <a className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        {label}
                    </a>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <form
                    action={mode === 'create' ? createInventory : editInventory}
                    id="create-inventory-form"
                >
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription>
                            {/* สร้างสินค้าใหม่ */}
                            {/* Make changes to your profile
          here. Click save when
          you&apos;re done. */}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center">
                        <Tabs defaultValue="account" className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="account">
                                    รายละเอียดสินค้า
                                </TabsTrigger>
                                <TabsTrigger
                                    asChild
                                    value="price"
                                    disabled={!inventory}
                                >
                                    <span
                                        className={cn(
                                            !!inventory &&
                                                'hover:cursor-pointer'
                                        )}
                                        data-tooltip-id="tab-disabled-tooltip"
                                        data-tooltip-content="จำเป็นต้องสร้างสินค้าก่อน"
                                        data-tooltip-hidden={!!inventory}
                                    >
                                        ราคา
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    asChild
                                    value="picture"
                                    disabled={!inventory}
                                >
                                    <span
                                        className={cn(
                                            !!inventory &&
                                                'hover:cursor-pointer'
                                        )}
                                        data-tooltip-id="tab-disabled-tooltip"
                                        data-tooltip-content="จำเป็นต้องสร้างสินค้าก่อน"
                                        data-tooltip-hidden={!!inventory}
                                    >
                                        รูปภาพ
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                            <Tooltip id="tab-disabled-tooltip" />
                            <Separator className="mt-2" />
                            <TabsContent value="account">
                                <div className="grid grid-cols-[1fr_3fr] content-start items-center gap-3 p-4">
                                    <Label
                                        className="col-start-1 text-right"
                                        htmlFor=""
                                    >
                                        รหัสสินค้า
                                    </Label>
                                    {mode === 'create' && (
                                        <Input
                                            name="barcode"
                                            type="text"
                                            className="ml-2 border border-slate-400 px-2"
                                        />
                                    )}
                                    {mode === 'edit' && (
                                        <span className="ml-2 px-2">
                                            {inventory?.code}
                                        </span>
                                    )}
                                    <Label
                                        className="col-start-1 text-right"
                                        htmlFor=""
                                    >
                                        ชื่อสินค้า
                                    </Label>
                                    <Input
                                        name="name"
                                        type="text"
                                        className="ml-2 border border-slate-400 px-2"
                                        defaultValue={inventory?.name}
                                    />
                                    <Label
                                        className="col-start-1 text-right"
                                        htmlFor=""
                                    >
                                        ยี่ห้อ
                                    </Label>
                                    <Input
                                        name="brand"
                                        type="text"
                                        className="ml-2 border border-slate-400 px-2"
                                        defaultValue={inventory?.brand?.name}
                                    />
                                    <Label
                                        className="col-start-1 text-right"
                                        htmlFor=""
                                    >
                                        รุ่นรถ
                                    </Label>
                                    <Input
                                        name="model"
                                        type="text"
                                        className="ml-2 border border-slate-400 px-2"
                                        defaultValue={inventory?.carModel?.name}
                                    />
                                    <Label
                                        className="col-start-1 text-right"
                                        htmlFor=""
                                    >
                                        คำค้นหาอื่นๆ
                                    </Label>
                                    <div className="flex flex-1 justify-between gap-2">
                                        <Input
                                            ref={tagInputRef}
                                            type="text"
                                            className="ml-2 w-full border border-slate-400 px-2"
                                        />
                                        <Button
                                            type="button"
                                            className="-mr-2"
                                            variant={'secondary'}
                                            onClick={(e) => onAddTag()}
                                        >
                                            เพิ่ม
                                        </Button>
                                        {/* <span>เพิ่ม</span> */}
                                    </div>
                                    <div className="col-start-2 flex flex-wrap gap-1">
                                        {tags.map((tag, i) => (
                                            <Fragment key={i}>
                                                <Badge
                                                    variant={'secondary'}
                                                    onClick={() =>
                                                        onDeleteTag(i)
                                                    }
                                                >
                                                    {tag}
                                                </Badge>
                                                <input
                                                    hidden
                                                    readOnly
                                                    value={tag}
                                                    name="tags"
                                                />
                                            </Fragment>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="price">
                                <Table>
                                    <TableCaption>
                                        A list of your recent invoices.
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">
                                                Barcode
                                            </TableHead>
                                            <TableHead>จำนวนชิ้น</TableHead>
                                            <TableHead>หน่วย</TableHead>
                                            <TableHead className="text-right">
                                                ราคา
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* {invoices.map((invoice) => (
    <TableRow key={invoice.invoice}>
      <TableCell className="font-medium">{invoice.invoice}</TableCell>
      <TableCell>{invoice.paymentStatus}</TableCell>
      <TableCell>{invoice.paymentMethod}</TableCell>
      <TableCell className="text-right">{invoice.totalAmount}</TableCell>
    </TableRow>
            ))} */}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                Total
                                            </TableCell>
                                            <TableCell className="text-right">
                                                $2,500.00
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TabsContent>
                            <TabsContent value="picture">
                                <Input type="file" />
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        {/* <p className='text-center text-red-600'>
              {state?.message}
            </p> */}
                        <Button type="submit" form="create-inventory-form">
                            บันทึก
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
