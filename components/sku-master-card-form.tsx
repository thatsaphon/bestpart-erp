'use client'

import {
    Brand,
    CarModel,
    GoodsMaster,
    Image as PrismaImage,
    SkuMaster,
} from '@prisma/client'
import { Fragment, useEffect, useState } from 'react'
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
import { Barcode } from 'lucide-react'
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

type Props = {
    skuMaster: SkuMaster & {
        brand?: Brand | null
        carModel?: CarModel | null
        goodsMasters: GoodsMaster[]
        images: PrismaImage[]
    }
}

export default function SkuMasterCardForm({ skuMaster }: Props) {
    const [isEdit, setIsEdit] = useState(false)
    const [file, setFile] = useState<File | null | undefined>(null)
    const [goodsMasters, setGoodsMasters] = useState<Partial<GoodsMaster>[]>(
        skuMaster.goodsMasters
    )

    const [state, formAction] = useFormState(createOrUpdateGoodsMasters, {
        error: '',
    })
    useEffect(() => {
        setGoodsMasters(skuMaster.goodsMasters)
        setIsEdit(false)
    }, [skuMaster])
    return (
        <form action={formAction}>
            <input
                type="text"
                value={skuMaster.id}
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
                                    defaultValue={skuMaster.detail}
                                    name="detail"
                                />
                            ) : (
                                skuMaster.detail
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isEdit ? (
                                <Input
                                    defaultValue={skuMaster.remark || ''}
                                    name="remark"
                                />
                            ) : (
                                skuMaster.remark
                            )}
                        </CardDescription>
                    </div>
                    <div className="space-x-2">
                        {isEdit && <Button type="submit">บันทึก</Button>}
                        <Button
                            variant={'outline'}
                            onClick={() => {
                                setIsEdit(!isEdit)
                                setGoodsMasters(skuMaster.goodsMasters)
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
                                <Fragment key={i}>
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
                                        key={file.name}
                                        width={500}
                                        height={500}
                                    />
                                )}
                                <Input
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0])
                                    }
                                    // ref={ref}
                                    type="file"
                                    accept="image/*"
                                    name="file"
                                />
                                {file && (
                                    <Button
                                        formAction={async (formData) => {
                                            try {
                                                const fileName =
                                                    window.crypto.randomUUID() +
                                                    '.jpeg'
                                                const result = await uploadFile(
                                                    fileName,
                                                    file,
                                                    'sku'
                                                )
                                                if (result) {
                                                    await addImageToTag(
                                                        formData,
                                                        fileName
                                                    )
                                                }
                                            } catch (err) {}
                                        }}
                                    >
                                        Submit
                                    </Button>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {skuMaster.images.map((image) => (
                                        <Image
                                            src={image.path}
                                            alt={skuMaster.detail}
                                            key={image.id}
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
