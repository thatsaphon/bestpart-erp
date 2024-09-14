import { Badge, BadgeProps } from '@/components/ui/badge'
import { PurchaseOrderStatus } from '@prisma/client'
import React from 'react'

type Props = BadgeProps & { status: PurchaseOrderStatus }

const purchaseOrderStatus = {
    Draft: 'ร่าง',
    Submitted: 'สั่งซื้อแล้ว',
    PartiallyReceived: 'รับของบางส่วน',
    FullyReceived: 'รับของแล้ว',
    Closed: 'Closed',
    Cancelled: 'ยกเลิก',
}
const variant = {
    Draft: 'destructive' as const,
    Submitted: 'outline' as const,
    PartiallyReceived: 'outline' as const,
    FullyReceived: 'outline' as const,
    Closed: 'secondary' as const,
    Cancelled: 'secondary' as const,
}

export default function PurchaseOrderStatusBadge({
    status,
    className,
    ...props
}: Props) {
    return (
        <Badge variant={variant[status]} {...props} className={className}>
            {purchaseOrderStatus[status]}
        </Badge>
    )
}
