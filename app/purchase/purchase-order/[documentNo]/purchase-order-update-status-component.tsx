'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { purchaseOrderStatus } from '@/types/purchase-order/purchase-order-status'
import { PurchaseOrderStatus } from '@prisma/client'
import React from 'react'
import { updatePurchaseOrderStatus } from './update-purchase-order-status'
import { useFormState, useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'

type Props = {
    purchaseOrderId: number
    existingStatus: PurchaseOrderStatus
}

export default function PurchaseOrderUpdateStatusComponent({
    purchaseOrderId,
    existingStatus,
}: Props) {
    const [status, setStatus] =
        React.useState<PurchaseOrderStatus>(existingStatus)
    const [loading, setLoading] = React.useState(false)

    return (
        <form>
            <div className="flex items-center gap-2">
                <span>เปลี่ยนสถานะ:</span>
                <Select
                    defaultValue={existingStatus}
                    name="status"
                    onValueChange={(value) =>
                        setStatus(value as PurchaseOrderStatus)
                    }
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Status"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            {Object.entries(purchaseOrderStatus).map(
                                ([status, label]) => (
                                    <SelectItem key={status} value={status}>
                                        {label}
                                    </SelectItem>
                                )
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button
                    disabled={loading}
                    onClick={async () => {
                        try {
                            setLoading(true)
                            await updatePurchaseOrderStatus(
                                purchaseOrderId,
                                status
                            )
                            toast.success('บันทึกสําเร็จ')
                        } catch (err) {
                            toast.error('Something went wrong')
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    ยืนยัน
                </Button>
            </div>
        </form>
    )
}
