'use client'

import { SkuTree } from '@/types/sku-tree/sku-tree'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { PencilIcon, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MainSkuRemark } from '@prisma/client'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateMainSku } from './update-main-sku'
import toast from 'react-hot-toast'

type Props = {
    skuTree: SkuTree['items'][0]
}

export default function UpdateMainSkuForm({ skuTree }: Props) {
    const [isEdit, setIsEdit] = React.useState(false)
    const [name, setName] = React.useState(skuTree.name)
    const [partNumber, setPartNumber] = React.useState(skuTree.partNumber)
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [remarkInput, setRemarkInput] = React.useState('')
    const [remarks, setRemarks] = React.useState<{ remark: string }[]>(
        skuTree.MainSkuRemark
    )

    const addRemark = () => {
        if (remarks.find((remark) => remark.remark === remarkInput))
            return toast.error('Remark already exists')

        setRemarks([...remarks, { remark: remarkInput }])
        setRemarkInput('')
    }

    return isEdit ? (
        <>
            <form
                action={async () => {
                    try {
                        updateMainSku(skuTree.mainSkuId, {
                            name,
                            partNumber,
                            searchKeyword,
                            MainSkuRemark: {
                                connectOrCreate: remarks.map((remark) => ({
                                    where: { remark: remark.remark },
                                    create: { remark: remark.remark },
                                })),
                                set: remarks.map((remark) => ({
                                    remark: remark.remark,
                                })),
                            },
                        })
                        setIsEdit(false)
                        toast.success('บันทึกสําเร็จ')
                    } catch (err) {
                        if (err instanceof Error)
                            return toast.error(err.message)
                        toast.error('Something went wrong')
                    }
                }}
            >
                <h1>
                    <Label>ชื่อสินค้า</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </h1>
                <h2>
                    <Label>Part Number</Label>
                    <Input
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                    />
                </h2>
                <h2>
                    <Label>Search keyword:</Label>
                    <Input
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </h2>
                <Label>Remark</Label>
                <div className="my-1 flex flex-wrap gap-2">
                    {remarks.map((remark) => (
                        <Badge
                            key={remark.remark}
                            variant={'outline'}
                            className="bg-background"
                        >
                            {remark.remark}
                            <Trash
                                className="ml-1 inline h-4 w-4 bg-background hover:cursor-pointer"
                                onClick={() =>
                                    setRemarks(
                                        remarks.filter(
                                            (r) => r.remark !== remark.remark
                                        )
                                    )
                                }
                            />
                        </Badge>
                    ))}
                    <Input
                        className="w-auto"
                        placeholder="Remark"
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
                </div>
                <Button>Save</Button>
                <Button
                    className="ml-1"
                    variant={'outline'}
                    onClick={() => {
                        setIsEdit(false)
                        setName(skuTree.name)
                        setPartNumber(skuTree.partNumber)
                        setRemarkInput('')
                        setRemarks(skuTree.MainSkuRemark)
                    }}
                >
                    Cancel
                </Button>
            </form>
        </>
    ) : (
        <>
            <h1 className="text-3xl">
                {skuTree.name}{' '}
                <PencilIcon
                    className="inline h-4 w-4 hover:cursor-pointer"
                    onClick={() => setIsEdit(true)}
                />
            </h1>
            <h2 className="text-primary">{skuTree.partNumber}</h2>
            <h2 className="flex gap-2 text-primary">
                {skuTree.MainSkuRemark.map((remark) => (
                    <Badge key={remark.remark} variant={'outline'}>
                        {remark.remark}
                    </Badge>
                ))}
            </h2>
        </>
    )
}
