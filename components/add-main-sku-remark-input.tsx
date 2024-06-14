'use client'

import React, { useState } from 'react'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Input } from './ui/input'
import { Button } from './ui/button'
import toast from 'react-hot-toast'
import { upsertMainSkuRemark } from '@/app/inventory/remark-action/main-sku-remark'

type Props = {
    mainSku: number
}

export default function AddMainSkuRemarkInput({ mainSku }: Props) {
    const [isEdit, setIsEdit] = useState(false)
    const [remark, setRemark] = useState('')

    async function onClick() {
        if (!remark) {
            setRemark('')
            setIsEdit(false)
            return
        }
        try {
            await upsertMainSkuRemark(remark, mainSku)
            toast.success('Remark added')
            setIsEdit(false)
            setRemark('')
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)

            return toast.error('Something went wrong')
        }
    }
    return (
        <>
            {isEdit ? (
                <div className="flex gap-1">
                    <Input
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onClick()
                        }}
                        onChange={(e) => setRemark(e.target.value)}
                        value={remark}
                    />{' '}
                    <Button className="button" onClick={onClick}>
                        Add
                    </Button>
                </div>
            ) : (
                <PlusCircledIcon
                    className="ml-2 inline h-4 w-4 hover:cursor-pointer"
                    onClick={() => setIsEdit(true)}
                />
            )}
        </>
    )
}
