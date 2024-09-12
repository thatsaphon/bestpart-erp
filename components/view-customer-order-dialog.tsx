import React from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { GetQuotation } from '@/types/quotation/quotation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GetCustomerOrder } from '@/types/customer-order/customer-order'

type Props = {
    customerOrders: GetCustomerOrder[]
    children?: React.ReactNode
}

export default function ViewCustomerOrderDialog({
    customerOrders,
    children,
}: Props) {
    const [expandList, setExpandList] = React.useState<boolean[]>(
        customerOrders.map(() => false)
    )
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button variant="outline">ใบจองสินค้า</Button>}
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
                                <TableHead className="text-right">
                                    มัดจำ
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customerOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        ไม่พบข้อมูล
                                    </TableCell>
                                </TableRow>
                            )}
                            {customerOrders.map((customerOrder, index) => (
                                <React.Fragment key={customerOrder.id}>
                                    <TableRow
                                        onClick={() =>
                                            setExpandList((prev) => [
                                                ...prev.slice(0, index),
                                                !prev[index],
                                                ...prev.slice(index + 1),
                                            ])
                                        }
                                        key={customerOrder.id}
                                        className={cn(
                                            'hover:cursor-pointer',
                                            expandList[index]
                                                ? 'bg-primary/10 hover:bg-primary/20'
                                                : ''
                                        )}
                                    >
                                        <TableCell>
                                            {customerOrder.documentNo}
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                customerOrder.date,
                                                'dd/MM/yyyy'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {
                                                customerOrder.CustomerOrder
                                                    ?.Contact?.name
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {
                                                customerOrder.CustomerOrder
                                                    ?.status
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {customerOrder.CustomerOrder?.CustomerOrderItem.reduce(
                                                (total, item) =>
                                                    total +
                                                    item.pricePerUnit *
                                                        item.quantity,
                                                0
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {
                                                -(
                                                    customerOrder.CustomerOrder?.GeneralLedger.reduce(
                                                        (total, item) =>
                                                            item.ChartOfAccount
                                                                .isDeposit
                                                                ? total +
                                                                  item.amount
                                                                : total,
                                                        0
                                                    )?.toFixed(2) || 0
                                                )
                                            }
                                        </TableCell>
                                        {/* <TableCell>
                                            <ChevronDown
                                                className="hover:cursor-pointer hover:text-primary"
                                                onClick={() =>
                                                    setExpandList((prev) => [
                                                        ...prev.slice(0, index),
                                                        !prev[index],
                                                        ...prev.slice(
                                                            index + 1
                                                        ),
                                                    ])
                                                }
                                            />
                                        </TableCell> */}
                                    </TableRow>
                                    {expandList[index] && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
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
                                                        {customerOrder.CustomerOrder?.CustomerOrderItem.map(
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
                                                                            item.pricePerUnit
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="pr-0 text-right">
                                                                        {item.pricePerUnit *
                                                                            item.quantity}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
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
