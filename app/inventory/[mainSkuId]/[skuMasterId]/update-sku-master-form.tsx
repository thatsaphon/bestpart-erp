'use client'

import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { inputNumberPreventDefault } from '@/lib/input-number-prevent-default'
import { Cross1Icon } from '@radix-ui/react-icons'
import { PencilIcon, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast'
import { updateSkuMaster } from './update-sku-master'

type Props = {
    skuMaster: Awaited<
        ReturnType<typeof searchSkuTreeDetail>
    >['items'][0]['SkuMaster'][0]
}

export default function UpdateSkuMasterForm({ skuMaster }: Props) {
    const [isEdit, setIsEdit] = React.useState(false)
    const [detail, setDetail] = React.useState(skuMaster.detail)
    const [skuMasterRemarks, setSkuMasterRemarks] = React.useState<
        { remark: string }[]
    >(skuMaster.SkuMasterRemark)
    const [remarkInput, setRemarkInput] = React.useState('')
    const [goodsMasters, setGoodsMasters] = React.useState(
        skuMaster.GoodsMaster
    )

    const addRemark = () => {
        if (skuMasterRemarks.find((remark) => remark.remark === remarkInput))
            return toast.error('Remark already exists')

        setSkuMasterRemarks([...skuMasterRemarks, { remark: remarkInput }])
        setRemarkInput('')
    }

    const addNewGoodsMaster = () => {
        setGoodsMasters([
            ...goodsMasters,
            {
                goodsMasterId: 0,
                remaining: 0,
                unit: '',
                pricePerUnit: 0,
                name: '',
                detail: '',
                MainSkuRemark: [],
                SkuMasterRemark: [],
                quantityPerUnit: 0,
                quantity: 1,
                Image: [],
                barcode: '',
            },
        ])
    }

    const onFormSubmit = async () => {
        try {
            await updateSkuMaster(skuMaster.skuMasterId, {
                detail,
                SkuMasterRemark: {
                    connectOrCreate: skuMasterRemarks.map((remark) => ({
                        where: { remark: remark.remark },
                        create: { remark: remark.remark },
                    })),
                    set: skuMasterRemarks.map((remark) => ({
                        remark: remark.remark,
                    })),
                },
                GoodsMaster: {
                    updateMany: goodsMasters
                        .map(
                            ({
                                goodsMasterId,
                                pricePerUnit,
                                quantityPerUnit,
                                unit,
                                barcode,
                            }) => ({
                                where: { id: goodsMasterId },
                                data: {
                                    pricePerUnit,
                                    quantityPerUnit,
                                    unit,
                                    barcode,
                                },
                            })
                        )
                        .filter(({ where: { id } }) => id !== 0),
                    // createMany:
                    createMany: {
                        data: goodsMasters
                            .filter(({ goodsMasterId }) => goodsMasterId === 0)
                            .map(
                                ({
                                    pricePerUnit,
                                    quantityPerUnit,
                                    unit,
                                    barcode,
                                }) => ({
                                    pricePerUnit,
                                    quantityPerUnit,
                                    unit,
                                    barcode: barcode || '',
                                })
                            ),
                    },
                },
            })
            toast.success('บันทึกสำเร็จ')
            setIsEdit(false)
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            toast.error('Something went wrong.')
        }
    }

    return !isEdit ? (
        <Card key={`${skuMaster.skuMasterId}`}>
            <CardHeader>
                <CardTitle>
                    {skuMaster.detail}{' '}
                    <PencilIcon
                        className="ml-2 inline h-4 w-4 hover:cursor-pointer"
                        onClick={() => setIsEdit(true)}
                    />
                </CardTitle>
                <CardDescription>
                    {skuMaster.SkuMasterRemark.map((remark) => (
                        <Badge
                            key={`remark-${skuMaster.skuMasterId}-${remark.remark}`}
                            variant={'outline'}
                        >
                            {remark.remark}
                        </Badge>
                    ))}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                    <div className="grid grid-cols-[80px_1fr_1fr_1fr] place-content-start gap-2 rounded-md border-2 border-dashed p-4">
                        <div className="text-center">คงเหลือ</div>
                        <div>Barcode</div>
                        <div>หน่วย</div>
                        <div className="text-right">ราคา</div>
                        {skuMaster.GoodsMaster.map((goodsMaster) => (
                            <React.Fragment
                                key={`goodsMaster-${goodsMaster.goodsMasterId}`}
                            >
                                <div className="text-center">
                                    {goodsMaster.remaining}
                                </div>
                                <div>{goodsMaster.barcode}</div>
                                <div>{`${goodsMaster.unit}(${goodsMaster.quantityPerUnit})`}</div>
                                <div className="text-right">
                                    {goodsMaster.pricePerUnit.toLocaleString()}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {skuMaster.Image.map((image) => (
                            <Image
                                key={`image-${skuMaster.skuMasterId}-${image}`}
                                src={image.path}
                                alt={skuMaster.detail}
                                className="w-full"
                                width={300}
                                height={300}
                                unoptimized
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    ) : (
        <Card>
            <form action={onFormSubmit}>
                <CardHeader>
                    <CardTitle>
                        <Input
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="รายละเอียดสินค้า"
                        />
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                        {skuMasterRemarks.map((remark) => (
                            <Badge
                                key={`remark-${skuMaster.skuMasterId}-${remark.remark}`}
                                variant={'outline'}
                                className="bg-background"
                            >
                                {remark.remark}
                            </Badge>
                        ))}
                        <Input
                            className="w-auto"
                            onChange={(e) => setRemarkInput(e.target.value)}
                            value={remarkInput}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addRemark()
                                }
                            }}
                        />
                        <Button onClick={addRemark}>Add</Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] place-content-start items-center gap-2 rounded-md border-2 border-dashed p-4">
                            {/* <div className="text-center">id</div> */}
                            <div>Barcode</div>
                            <div>หน่วย</div>
                            <div>จำนวนต่อหน่วย</div>
                            <div className="text-right">ราคา</div>
                            {goodsMasters.map((goodsMaster, index) => (
                                <React.Fragment
                                    key={`goodsMaster-${goodsMaster.goodsMasterId}`}
                                >
                                    <div className="col-start-1">
                                        <Input
                                            value={goodsMaster.barcode}
                                            onChange={(e) => {
                                                setGoodsMasters(
                                                    goodsMasters.map((gm) =>
                                                        gm.goodsMasterId ===
                                                        goodsMaster.goodsMasterId
                                                            ? {
                                                                  ...gm,
                                                                  barcode:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : gm
                                                    )
                                                )
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            value={goodsMaster.unit}
                                            onChange={(e) => {
                                                setGoodsMasters(
                                                    goodsMasters.map((gm) =>
                                                        gm.goodsMasterId ===
                                                        goodsMaster.goodsMasterId
                                                            ? {
                                                                  ...gm,
                                                                  unit: e.target
                                                                      .value,
                                                              }
                                                            : gm
                                                    )
                                                )
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            value={goodsMaster.quantityPerUnit}
                                            type="number"
                                            onKeyDown={(e) =>
                                                inputNumberPreventDefault(e)
                                            }
                                            onChange={(e) => {
                                                setGoodsMasters(
                                                    goodsMasters.map((gm) =>
                                                        gm.goodsMasterId ===
                                                        goodsMaster.goodsMasterId
                                                            ? {
                                                                  ...gm,
                                                                  quantityPerUnit:
                                                                      +e.target
                                                                          .value,
                                                              }
                                                            : gm
                                                    )
                                                )
                                            }}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <Input
                                            value={goodsMaster.pricePerUnit}
                                            type="number"
                                            onKeyDown={(e) =>
                                                inputNumberPreventDefault(e)
                                            }
                                            onChange={(e) => {
                                                setGoodsMasters(
                                                    goodsMasters.map((gm) =>
                                                        gm.goodsMasterId ===
                                                        goodsMaster.goodsMasterId
                                                            ? {
                                                                  ...gm,
                                                                  pricePerUnit:
                                                                      +e.target
                                                                          .value,
                                                              }
                                                            : gm
                                                    )
                                                )
                                            }}
                                        />
                                    </div>
                                    <div className="text-right">
                                        {!goodsMaster.goodsMasterId && (
                                            <Cross1Icon
                                                className="h-4 w-4 text-destructive hover:cursor-pointer"
                                                onClick={() =>
                                                    setGoodsMasters(
                                                        goodsMasters.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        )
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </React.Fragment>
                            ))}
                            <div className="col-span-4 place-self-center">
                                <PlusCircle onClick={addNewGoodsMaster} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {skuMaster.Image.map((image) => (
                                <div className="relative">
                                    <Image
                                        key={`image-${skuMaster.skuMasterId}-${image}`}
                                        src={image.path}
                                        alt={skuMaster.detail}
                                        className="w-full"
                                        width={300}
                                        height={300}
                                        unoptimized
                                    />
                                    <div className="absolute right-0 top-0">
                                        <Cross1Icon className="hover:cursor-pointer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="mr-2">บันทึก</Button>
                    <Button
                        variant={'outline'}
                        onClick={() => setIsEdit(false)}
                    >
                        ยกเลิก
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
