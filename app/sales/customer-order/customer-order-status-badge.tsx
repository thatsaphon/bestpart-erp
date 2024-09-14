import { Badge, BadgeProps } from '@/components/ui/badge'
import { CustomerOrderStatus } from '@prisma/client'
import React from 'react'

type Props = BadgeProps & { status: CustomerOrderStatus }

const customerOrderStatus = {
    Pending: 'ยังไม่สั่งของ',
    POCreated: 'ออก PO แล้ว',
    Ordered: 'สั่งของแล้ว',
    Received: 'ร้านได้รับสินค้าแล้ว',
    SOCreated: 'ขายแล้ว',
    Closed: 'Closed',
    Cancelled: 'ยกเลิก',
}
const variant = {
    Pending: 'destructive' as const,
    POCreated: 'destructive' as const,
    Ordered: 'destructive' as const,
    Received: 'outline' as const,
    SOCreated: 'outline' as const,
    Closed: 'secondary' as const,
    Cancelled: 'secondary' as const,
}

export default function CustomerOrderStatusBadge({
    status,
    className,
    ...props
}: Props) {
    return (
        <Badge variant={variant[status]} {...props} className={className}>
            {customerOrderStatus[status]}
        </Badge>
    )
}
