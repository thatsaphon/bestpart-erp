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

type Props = {
    quotations: GetQuotation[]
}

export default function ViewQuotationDialog({ quotations }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    View quotations
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View quotations</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quotation no.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotations.map((quotation, index) => (
                                <TableRow key={quotation.id}>
                                    <TableCell>
                                        {quotation.documentNo}
                                    </TableCell>
                                    <TableCell>
                                        {format(quotation.date, 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {quotation.Quotation?.Contact?.name}
                                    </TableCell>
                                    <TableCell>
                                        {quotation.Quotation?.QuotationItem.reduce(
                                            (total, item) =>
                                                total +
                                                item.pricePerUnit *
                                                    item.quantity,
                                            0
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogDescription>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button size="sm">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
