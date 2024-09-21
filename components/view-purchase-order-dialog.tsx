'use client'

import React from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { GetPurchaseOrder } from '@/types/purchase-order/purchase-order'

type Props = {
    purchaseOrders: GetPurchaseOrder[]
    children?: React.ReactNode
    selectedPurchaseOrderIds?: number[]
    onSelect?: (data: GetPurchaseOrder) => void
    onRemove?: (data: GetPurchaseOrder) => void
}

export default function ViewPurchaseOrderDialog({
    purchaseOrders,
    children,
    selectedPurchaseOrderIds = [],
    onSelect,
    onRemove,
}: Props) {
    const [expandList, setExpandList] = React.useState<boolean[]>(
        purchaseOrders.map(() => false)
    )
    const [open, setOpen] = React.useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button variant="outline">ใบสั่งซื้อ</Button>}
            </DialogTrigger>
            <DialogContent className="flex h-[500px] min-w-[900px] flex-col">
                <DialogHeader>
                    <DialogTitle>ใบจองสินค้า</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-scroll">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation no.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                                {onSelect && onRemove && (
                                    <TableHead className="w-[100px]"></TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        ไม่พบข้อมูล
                                    </TableCell>
                                </TableRow>
                            )}
                            {purchaseOrders.map((purchaseOrder, index) => (
                                <React.Fragment key={purchaseOrder.id}>
                                    <TableRow
                                        onClick={() =>
                                            setExpandList((prev) => [
                                                ...prev.slice(0, index),
                                                !prev[index],
                                                ...prev.slice(index + 1),
                                            ])
                                        }
                                        key={purchaseOrder.id}
                                        className={cn(
                                            'hover:cursor-pointer',
                                            expandList[index]
                                                ? 'bg-primary/10 hover:bg-primary/20'
                                                : ''
                                        )}
                                    >
                                        <TableCell>
                                            {purchaseOrder.documentNo}
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                purchaseOrder.date,
                                                'dd/MM/yyyy'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {
                                                purchaseOrder.PurchaseOrder
                                                    ?.Contact?.name
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {
                                                purchaseOrder.PurchaseOrder
                                                    ?.status
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {purchaseOrder.PurchaseOrder?.PurchaseOrderItem.reduce(
                                                (total, item) =>
                                                    total +
                                                    item.costPerUnit *
                                                        item.quantity,
                                                0
                                            )}
                                        </TableCell>
                                        {onSelect && onRemove && (
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        !selectedPurchaseOrderIds.includes(
                                                            purchaseOrder.id
                                                        )
                                                            ? onSelect(
                                                                  purchaseOrder
                                                              )
                                                            : onRemove(
                                                                  purchaseOrder
                                                              )
                                                    }}
                                                    variant={
                                                        selectedPurchaseOrderIds.includes(
                                                            purchaseOrder.id
                                                        )
                                                            ? 'outline'
                                                            : 'default'
                                                    }
                                                >
                                                    {selectedPurchaseOrderIds.includes(
                                                        purchaseOrder.id
                                                    )
                                                        ? 'ยกเลิก'
                                                        : 'เลือก'}
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                    {expandList[index] && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    onSelect && onRemove ? 7 : 6
                                                }
                                                className="py-0"
                                            >
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="pl-0">
                                                                Barcode
                                                            </TableHead>
                                                            <TableHead>
                                                                Name
                                                            </TableHead>

                                                            <TableHead className="text-right">
                                                                Quantity
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Unit
                                                            </TableHead>

                                                            <TableHead className="text-right">
                                                                Price
                                                            </TableHead>
                                                            <TableHead className="pr-0 text-right">
                                                                Total
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {purchaseOrder.PurchaseOrder?.PurchaseOrderItem.map(
                                                            (item) => (
                                                                <TableRow
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >
                                                                    <TableCell className="pl-0">
                                                                        {
                                                                            item.barcode
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {`${item.unit}(${item.quantityPerUnit})`}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {
                                                                            item.costPerUnit
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="pr-0 text-right">
                                                                        {item.costPerUnit *
                                                                            item.quantity}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                    <TableFooter>
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={5}
                                                                className="text-right"
                                                            >
                                                                Total
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {purchaseOrder.PurchaseOrder?.PurchaseOrderItem.reduce(
                                                                    (
                                                                        total,
                                                                        item
                                                                    ) =>
                                                                        total +
                                                                        item.costPerUnit *
                                                                            item.quantity,
                                                                    0
                                                                ).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                </Table>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
