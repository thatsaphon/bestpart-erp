'use client'

import { GoodsMaster } from '@prisma/client'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from './ui/card'
import { Input } from './ui/input'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { createOrUpdateGoodsMasters } from '@/app/actions/inventory/goodsMaster'
import { useFormState } from 'react-dom'
import { Barcode, Trash2Icon } from 'lucide-react'
import { generateBarcode } from '@/app/actions/inventory/generateBarcode'
import toast from 'react-hot-toast'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './ui/accordion'
import Image from 'next/image'
import { addImageToTag } from '@/app/actions/inventory/addImageToFlag'
import { uploadFile } from '@/lib/s3-client'
import { InventoryDetailType } from '@/types/inventory-detail'
import { uploadSkuMasterImage } from '@/app/inventory/upload-sku'
import { Badge } from './ui/badge'
import { disconnectSkuMasterRemark } from '@/app/inventory/remark-action/sku-master-remark'
import AddSkuMasterRemarkInput from './add-sku-master-remark-input'

type Props = {
    skuDetail: InventoryDetailType[]
}

export default function SkuMasterCardForm({ skuDetail }: Props) {
    const [isEdit, setIsEdit] = useState(false)
    const [file, setFile] = useState<File | null | undefined>(null)
    const [goodsMasters, setGoodsMasters] = useState<Partial<GoodsMaster>[]>(
        skuDetail.map((detail) => ({
            id: detail.goodsMasterId,
            barcode: detail.barcode,
            price: detail.price,
            quantity: detail.quantityPerUnit,
            unit: detail.unit,
        }))
    )

    const ref = useRef<HTMLFormElement>(null)

    const [state, formAction] = useFormState(createOrUpdateGoodsMasters, {
        error: '',
    })
    useEffect(() => {
        setGoodsMasters(
            skuDetail.map((detail) => ({
                id: detail.goodsMasterId,
                barcode: detail.barcode,
                price: detail.price,
                quantity: detail.quantityPerUnit,
                unit: detail.unit,
            }))
        )
        setIsEdit(false)
    }, [skuDetail])
    return (
        <form action={formAction} ref={ref}>
            <input
                type="text"
                value={skuDetail[0].skuMasterId}
                readOnly
                hidden
                name="skuMasterId"
            />
            <Card className="items-center bg-primary-foreground">
                <CardHeader className="flex-row justify-between p-3">
                    <div>
                        <CardTitle className="text-lg">
                            {isEdit ? (
                                <Input
                                    defaultValue={skuDetail[0].detail}
                                    name="detail"
                                />
                            ) : (
                                skuDetail[0].detail
                            )}
                        </CardTitle>
                        <div>
                            {skuDetail[0].SkuMasterRemarks?.map((remark) => (
                                <Badge key={remark.name} variant={'outline'}>
                                    {remark.name}
                                    <Trash2Icon
                                        className="ml-1 h-4 w-4"
                                        onClick={async () => {
                                            try {
                                                await disconnectSkuMasterRemark(
                                                    remark.id,
                                                    skuDetail[0].skuMasterId
                                                )
                                                toast.success('Remark updated')
                                            } catch (err) {
                                                if (err instanceof Error)
                                                    return toast.error(
                                                        err.message
                                                    )
                                                toast.error(
                                                    'Something went wrong'
                                                )
                                            }
                                        }}
                                    />
                                </Badge>
                            ))}
                            <AddSkuMasterRemarkInput
                                skuMasterId={skuDetail[0].skuMasterId}
                            />
                        </div>
                        {/* <CardDescription>
                            {isEdit ? (
                                <Input
                                    defaultValue={mainSkus[0].remark || ''}
                                    name="remark"
                                />
                            ) : (
                                mainSkus[0].remark
                            )}
                        </CardDescription> */}
                    </div>
                    <div className="space-x-2">
                        {isEdit && <Button type="submit">บันทึก</Button>}
                        <Button
                            variant={'outline'}
                            onClick={() => {
                                setIsEdit(!isEdit)
                                // setGoodsMasters(mainSkus.GoodsMaster)
                            }}
                            type="button"
                        >
                            {isEdit ? 'ยกเลิก' : 'แก้ไขราคา'}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-[2fr_1fr_1fr] border-b-2 border-primary">
                        <span>Barcode</span>
                        <span className="justify-self-end">หน่วย</span>
                        <span className="justify-self-end">ราคา</span>
                    </div>
                    <div className="grid grid-cols-[165px_1fr_1fr] items-center border-b-2">
                        {goodsMasters.map((goodsMaster, i) =>
                            isEdit ? (
                                <Fragment key={goodsMaster.barcode}>
                                    <input
                                        type="text"
                                        name="goodsMasterId"
                                        value={goodsMaster.id}
                                        hidden
                                        readOnly
                                    />
                                    <div className="flex items-center gap-1">
                                        <Barcode
                                            onClick={async () => {
                                                const result =
                                                    await generateBarcode()

                                                if (!result)
                                                    return toast.error(
                                                        'something wrong'
                                                    )

                                                const input =
                                                    document.getElementById(
                                                        `${goodsMaster.id}-${i}`
                                                    )
                                                if (input) {
                                                    ;(
                                                        input as HTMLInputElement
                                                    ).value = result
                                                }
                                            }}
                                        />
                                        <Input
                                            id={`${goodsMaster.id}-${i}`}
                                            name="barcode"
                                            className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            defaultValue={goodsMaster.barcode}
                                        />
                                    </div>
                                    <div className="flex">
                                        <Input
                                            name="unit"
                                            className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            defaultValue={goodsMaster.unit}
                                        />
                                        <Input
                                            name="quantity"
                                            type="number"
                                            className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            defaultValue={goodsMaster.quantity?.toString()}
                                        />
                                    </div>
                                    <Input
                                        name="price"
                                        className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        defaultValue={goodsMaster.price?.toString()}
                                    />
                                </Fragment>
                            ) : (
                                <Fragment key={i}>
                                    <span>{goodsMaster.barcode}</span>
                                    <span className="justify-self-end">
                                        {goodsMaster.unit}x
                                        {goodsMaster.quantity?.toString()}
                                    </span>
                                    <span className="justify-self-end">
                                        {goodsMaster.price?.toLocaleString()}
                                    </span>
                                </Fragment>
                            )
                        )}
                        {false && isEdit && (
                            <Fragment>
                                <input
                                    type="text"
                                    name="goodsMasterId"
                                    value={''}
                                    readOnly
                                    hidden
                                />
                                <Input
                                    name="barcode"
                                    className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <div className="flex">
                                    <Input
                                        name="unit"
                                        className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Input
                                        name="quantity"
                                        type="number"
                                        className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>
                                <Input
                                    name="price"
                                    className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </Fragment>
                        )}
                    </div>
                    <div className="my-1 flex w-full justify-center">
                        {isEdit && (
                            <PlusCircledIcon
                                className="h-4 w-4 text-muted-foreground hover:cursor-pointer hover:text-primary"
                                onClick={() =>
                                    setGoodsMasters((prev) => [
                                        ...prev,
                                        {
                                            id: undefined,
                                        },
                                    ])
                                }
                            />
                        )}
                        {isEdit && (
                            <span className="text-destructive">
                                {state.error}
                            </span>
                        )}
                    </div>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Image</AccordionTrigger>
                            <AccordionContent>
                                <input type="text" name="skuMasterId" hidden />
                                {file && (
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="picture"
                                        key={file?.name}
                                        width={500}
                                        height={500}
                                    />
                                )}
                                <Input
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0])
                                    }
                                    type="file"
                                    accept="image/*"
                                    name="file"
                                />
                                {file && (
                                    <Button
                                        formAction={async (formData) => {
                                            try {
                                                formData.append(
                                                    'fileName',
                                                    `${skuDetail[0].name}-${skuDetail[0].detail}`
                                                )
                                                const result =
                                                    await uploadSkuMasterImage(
                                                        formData
                                                    )
                                                toast.success(
                                                    'upload successfully'
                                                )
                                                ref.current?.reset()
                                            } catch (err) {
                                                console.log(err)
                                                toast.success(
                                                    'Something went wrong'
                                                )
                                            }
                                        }}
                                    >
                                        Submit
                                    </Button>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {skuDetail[0]?.images &&
                                        skuDetail[0]?.images?.map((image) => (
                                            <Image
                                                src={image}
                                                alt={skuDetail[0]?.detail}
                                                key={image}
                                                width={500}
                                                height={500}
                                            />
                                        ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                {/* <CardContent className="grid grid-cols-3 border-b-2 border-secondary pb-0"></CardContent> */}
            </Card>
        </form>
    )
}
