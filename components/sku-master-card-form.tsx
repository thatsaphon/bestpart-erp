'use client'

import { GoodsMaster } from '@prisma/client'
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
import { InventoryDetailType } from '@/types/inventory-detail'

type Props = {
    mainSkus: InventoryDetailType[]
}

export default function SkuMasterCardForm({ mainSkus }: Props) {
    const [isEdit, setIsEdit] = useState(false)
    const [file, setFile] = useState<File | null | undefined>(null)
    const [goodsMasters, setGoodsMasters] = useState<Partial<GoodsMaster>[]>(
        mainSkus.map((mainSku) => ({
            barcode: mainSku.barcode,
            price: mainSku.price,
            quantity: mainSku.quantityPerUnit,
            unit: mainSku.unit,
        }))
    )

    const [state, formAction] = useFormState(createOrUpdateGoodsMasters, {
        error: '',
    })
    useEffect(() => {
        setGoodsMasters(
            mainSkus.map((mainSku) => ({
                barcode: mainSku.barcode,
                price: mainSku.price,
                quantity: mainSku.quantityPerUnit,
                unit: mainSku.unit,
            }))
        )
        setIsEdit(false)
    }, [mainSkus])
    return (
        <form action={formAction}>
            <input
                type="text"
                value={mainSkus[0].skuMasterId}
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
                                    defaultValue={mainSkus[0].detail}
                                    name="detail"
                                />
                            ) : (
                                mainSkus[0].detail
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isEdit ? (
                                <Input
                                    defaultValue={mainSkus[0].remark || ''}
                                    name="remark"
                                />
                            ) : (
                                mainSkus[0].remark
                            )}
                        </CardDescription>
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

                                                console.log('first')
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
                                            } catch (err) {
                                                console.log(err)
                                            }
                                        }}
                                    >
                                        Submit
                                    </Button>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {mainSkus[0]?.images &&
                                        mainSkus[0]?.images?.map((image) => (
                                            <Image
                                                src={image}
                                                alt={mainSkus[0]?.detail}
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
