import { Badge, BadgeProps } from '@/components/ui/badge'
import { customerOrderStatus } from '@/types/customer-order/customer-order-status'
import { CustomerOrderStatus } from '@prisma/client'
import React from 'react'

type Props = BadgeProps & { status: CustomerOrderStatus }


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
