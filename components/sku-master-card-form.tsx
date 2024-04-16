'use client'

import { Brand, CarModel, GoodsMaster, SkuMaster } from '@prisma/client'
import React, { Fragment, useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from './ui/card'
import { Input } from './ui/input'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { createOrUpdateGoodsMasters } from '@/app/actions/inventory/goodsMaster'
import { useFormState } from 'react-dom'

type Props = {
    skuMaster: SkuMaster & {
        brand?: Brand | null
        carModel?: CarModel | null
        goodsMasters: GoodsMaster[]
    }
}

export default function SkuMasterCardForm({ skuMaster }: Props) {
    const [isEdit, setIsEdit] = useState(false)
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
                            {skuMaster.detail || ''}
                        </CardTitle>
                        <CardDescription>
                            {skuMaster.remark || ''}
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
                    <div className="grid grid-cols-3 border-b-2 border-primary">
                        <span>Barcode</span>
                        <span className="justify-self-end">หน่วย</span>
                        <span className="justify-self-end">ราคา</span>
                    </div>
                    <div className="grid grid-cols-3 items-center border-b-2">
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
                                    <Input
                                        name="code"
                                        className="my-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        defaultValue={goodsMaster.code}
                                    />
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
                                    <span>{goodsMaster.code}</span>
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
                                    name="code"
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
                </CardContent>
                <CardContent className="grid grid-cols-3 border-b-2 border-secondary pb-0"></CardContent>
            </Card>
        </form>
    )
}
