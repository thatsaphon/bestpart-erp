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
import { DocumentItem } from '@/types/document-item'
import { Cross1Icon } from '@radix-ui/react-icons'
import { PencilIcon, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast'
import { createSkuMaster } from './create-sku-master'
import { SkuTree } from '@/types/sku-tree/sku-tree'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'

type Props = {
    mainSku: SkuTree['items'][0]
}

export default function SkuMasterCreateForm({ mainSku }: Props) {
    const [detail, setDetail] = React.useState('')
    const [skuMasterRemarks, setSkuMasterRemarks] = React.useState<
        { remark: string }[]
    >([])
    const [remarkInput, setRemarkInput] = React.useState('')
    const [goodsMasters, setGoodsMasters] = React.useState<DocumentItem[]>([])

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
            await createSkuMaster(mainSku.mainSkuId, {
                detail,
                SkuMasterRemark: {
                    connectOrCreate: skuMasterRemarks.map((remark) => ({
                        where: { remark: remark.remark },
                        create: { remark: remark.remark },
                    })),
                },
                GoodsMaster: {
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
        } catch (err) {
            if (err instanceof Error) {
                if (err.message === 'NEXT_REDIRECT') {
                    toast.success('บันทึกสําเร็จ')
                    return
                }
                toast.error(err.message)
                return
            }
            toast.error('Something went wrong.')
        }
    }

    return (
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
                                key={`remark-${remark.remark}`}
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
                        <Button onClick={addRemark} type="button">
                            Add
                        </Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap justify-between gap-2 lg:grid lg:grid-cols-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">
                                        Barcode
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        หน่วย
                                    </TableHead>
                                    <TableHead className="text-right">
                                        ราคา
                                    </TableHead>
                                    <TableHead className="w-16 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {goodsMasters.map((goodsMaster, index) => (
                                    <TableRow
                                        key={`goodsMaster-${goodsMaster.goodsMasterId}-${index}`}
                                    >
                                        <TableCell>
                                            <Input
                                                placeholder="Barcode"
                                                value={goodsMaster.barcode}
                                                onChange={(e) => {
                                                    setGoodsMasters(
                                                        goodsMasters.map(
                                                            (gm, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...gm,
                                                                          barcode:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : gm
                                                        )
                                                    )
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="หน่วย"
                                                value={goodsMaster.unit}
                                                onChange={(e) => {
                                                    setGoodsMasters(
                                                        goodsMasters.map(
                                                            (gm, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...gm,
                                                                          unit: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : gm
                                                        )
                                                    )
                                                }}
                                            />{' '}
                                            <Input
                                                placeholder="จํานวนต่อหน่วย"
                                                value={
                                                    goodsMaster.quantityPerUnit ||
                                                    ''
                                                }
                                                type="number"
                                                onKeyDown={(e) =>
                                                    inputNumberPreventDefault(e)
                                                }
                                                onChange={(e) => {
                                                    setGoodsMasters(
                                                        goodsMasters.map(
                                                            (gm, i) =>
                                                                index === i
                                                                    ? {
                                                                          ...gm,
                                                                          quantityPerUnit:
                                                                              +e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : gm
                                                        )
                                                    )
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Input
                                                placeholder="ราคาต่อหน่วย"
                                                value={
                                                    goodsMaster.pricePerUnit ||
                                                    ''
                                                }
                                                type="number"
                                                onKeyDown={(e) =>
                                                    inputNumberPreventDefault(e)
                                                }
                                                onChange={(e) => {
                                                    setGoodsMasters(
                                                        goodsMasters.map(
                                                            (gm, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...gm,
                                                                          pricePerUnit:
                                                                              +e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : gm
                                                        )
                                                    )
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        <Button
                                            type="button"
                                            onClick={addNewGoodsMaster}
                                            size={'icon'}
                                            variant={'ghost'}
                                        >
                                            <PlusCircle />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="mr-2">บันทึก</Button>
                    {/* <Button
                        variant={'outline'}
                        onClick={() => setIsEdit(false)}
                    >
                        ยกเลิก
                    </Button> */}
                </CardFooter>
            </form>
        </Card>
    )
}
