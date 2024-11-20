import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getJournalVoucherDefaultFunction } from '@/types/journal-voucher/journal-voucher'
import { notFound } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export default async function JournalVoucherDetailPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const [document] = await getJournalVoucherDefaultFunction({
        where: { documentNo },
    })
    if (!document) return notFound()
    return (
        <div>
            <div className="flex w-[700px] flex-col space-y-4">
                <div className="flex w-full items-end gap-2">
                    <div className="w-full space-y-4">
                        <Label>คำอธิบาย</Label>
                        <Input
                            disabled
                            value={document.JournalVoucher?.journalDescription}
                        />
                    </div>
                    <Link
                        href={`/accounting/journal-voucher/${documentNo}/edit`}
                    >
                        <Button variant="destructive">แก้ไข</Button>
                    </Link>
                </div>
                <Label>วันที่</Label>
                <DatePickerWithPresets disabled defaultDate={document.date} />
                <Label>เลขที่เอกสาร</Label>
                <Input disabled value={document.documentNo} />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>ชื่อบัญชี</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {document.JournalVoucher?.GeneralLedger?.map(
                        (gl, index) => (
                            <TableRow key={index}>
                                <TableCell>{gl.ChartOfAccount.id}</TableCell>
                                <TableCell>{gl.ChartOfAccount.name}</TableCell>
                                <TableCell className="text-right">
                                    {gl.amount >= 0 &&
                                        gl.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {gl.amount < 0 &&
                                        (-gl.amount).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
