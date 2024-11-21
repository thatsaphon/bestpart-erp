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

type Props = {
    quotations: GetQuotation[]
    children?: React.ReactNode
}

export default function ViewQuotationDialog({ quotations, children }: Props) {
    const [expandList, setExpandList] = React.useState<boolean[]>(
        quotations.map(() => false)
    )
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button variant="outline">ใบเสนอราคา</Button>}
            </DialogTrigger>
            <DialogContent className="flex h-[500px] w-[800px] flex-col">
                <DialogHeader>
                    <DialogTitle>ใบเสนอราคา</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-scroll">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation no.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        ไม่พบข้อมูล
                                    </TableCell>
                                </TableRow>
                            )}
                            {quotations.map((quotation, index) => (
                                <React.Fragment key={quotation.id}>
                                    <TableRow
                                        onClick={() =>
                                            setExpandList((prev) => [
                                                ...prev.slice(0, index),
                                                !prev[index],
                                                ...prev.slice(index + 1),
                                            ])
                                        }
                                        key={quotation.id}
                                        className={cn(
                                            'hover:cursor-pointer',
                                            expandList[index]
                                                ? 'bg-primary/10 hover:bg-primary/20'
                                                : ''
                                        )}
                                    >
                                        <TableCell>
                                            {quotation.documentNo}
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                quotation.date,
                                                'dd/MM/yyyy'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {quotation.Quotation?.Contact?.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {quotation.Quotation?.QuotationItem.reduce(
                                                (total, item) =>
                                                    total +
                                                    item.pricePerUnit *
                                                        item.quantity,
                                                0
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    {expandList[index] && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
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
                                                        {quotation.Quotation?.QuotationItem.map(
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
