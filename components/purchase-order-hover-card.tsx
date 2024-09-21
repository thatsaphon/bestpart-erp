import { GetCustomerOrder } from '@/types/customer-order/customer-order'
import React from 'react'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Button } from './ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'
import { DocumentDetailReadonly } from './document-detail-readonly'
import { fullDateFormat } from '@/lib/date-format'
import CustomerOrderStatusBadge from '@/app/sales/customer-order/customer-order-status-badge'
import { GetPurchaseOrder } from '@/types/purchase-order/purchase-order'
import PurchaseOrderStatusBadge from '@/app/purchase/purchase-order/purchase-order-status-badge'

type Props = {
    purchaseOrder: GetPurchaseOrder
}

export default function PurchaseOrderHoverCard({ purchaseOrder }: Props) {
    return (
        <HoverCard>
            <HoverCardTrigger>
                {
                    <Button variant="link" type="button">
                        {purchaseOrder.documentNo}
                    </Button>
                }
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
                <div className="grid grid-cols-2">
                    <div>Document No: {purchaseOrder.documentNo}</div>
                    <div>Date: {fullDateFormat(purchaseOrder.date)}</div>
                    <div>
                        ชื่อลูกค้า: {purchaseOrder.PurchaseOrder?.Contact?.name}
                    </div>
                    <div>
                        สถานะ:{' '}
                        <PurchaseOrderStatusBadge
                            status={purchaseOrder.PurchaseOrder?.status!}
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>

                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">Unit</TableHead>

                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchaseOrder.PurchaseOrder?.PurchaseOrderItem.map(
                            (item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.barcode}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {`${item.unit}(${item.quantityPerUnit})`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.costPerUnit.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(
                                            item.costPerUnit * item.quantity
                                        ).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {purchaseOrder.PurchaseOrder?.PurchaseOrderItem.reduce(
                                    (total, item) =>
                                        total +
                                        item.costPerUnit * item.quantity,
                                    0
                                ).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </HoverCardContent>
        </HoverCard>
    )
}
