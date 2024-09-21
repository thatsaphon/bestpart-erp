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

type Props = {
    customerOrder: GetCustomerOrder
}

export default function CustomerOrderHoverCard({ customerOrder }: Props) {
    return (
        <HoverCard>
            <HoverCardTrigger>
                {
                    <Button variant="link" type="button">
                        {customerOrder.documentNo}
                    </Button>
                }
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
                <div className="grid grid-cols-2">
                    <div>Document No: {customerOrder.documentNo}</div>
                    <div>Date: {fullDateFormat(customerOrder.date)}</div>
                    <div>
                        ชื่อลูกค้า: {customerOrder.CustomerOrder?.Contact?.name}
                    </div>
                    <div>
                        มัดจำ:{' '}
                        {customerOrder.CustomerOrder?.GeneralLedger.reduce(
                            (acc, gl) =>
                                gl.ChartOfAccount.isDeposit
                                    ? acc + gl.amount
                                    : acc,
                            0
                        )}
                    </div>
                    <div>
                        สถานะ:{' '}
                        <CustomerOrderStatusBadge
                            status={customerOrder.CustomerOrder?.status!}
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
                        {customerOrder.CustomerOrder?.CustomerOrderItem.map(
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
                                        {item.pricePerUnit.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(
                                            item.pricePerUnit * item.quantity
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
                                {customerOrder.CustomerOrder?.CustomerOrderItem.reduce(
                                    (total, item) =>
                                        total +
                                        item.pricePerUnit * item.quantity,
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
