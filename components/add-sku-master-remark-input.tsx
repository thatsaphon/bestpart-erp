'use client'

import React, { useState } from 'react'
import { Badge } from './ui/badge'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { upsertSkuMasterRemark } from '@/app/inventory/remark-action/sku-master-remark'
import toast from 'react-hot-toast'

type Props = {
    skuMasterId: number
}

export default function AddSkuMasterRemarkInput({ skuMasterId }: Props) {
    const [isEdit, setIsEdit] = useState(false)
    const [remark, setRemark] = useState('')

    return (
        <>
            {isEdit ? (
                <div className="flex gap-1">
                    <Input
                        onChange={(e) => setRemark(e.target.value)}
                        value={remark}
                    />{' '}
                    <Button
                        onClick={async () => {
                            if (!remark) {
                                setRemark('')
                                setIsEdit(false)
                                return
                            }
                            try {
                                await upsertSkuMasterRemark(remark, skuMasterId)
                                toast.success('Remark added')
                                setIsEdit(false)
                                setRemark('')
                            } catch (err) {
                                if (err instanceof Error)
                                    return toast.error(err.message)

                                return toast.error('Something went wrong')
                            }
                        }}
                    >
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
