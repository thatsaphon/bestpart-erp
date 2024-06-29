'use client'

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Prisma } from '@prisma/client'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import CreateBillingNote from './create-billing-note-component'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const documentWithGeneralLedgerArSubledger =
    Prisma.validator<Prisma.DocumentDefaultArgs>()({
        include: { GeneralLedger: true, ArSubledger: true },
    })
type Props = {
    documents: Prisma.DocumentGetPayload<
        typeof documentWithGeneralLedgerArSubledger
    >[]
}

export default function ReceivableTable({ documents }: Props) {
    const [selectItems, setSelectItems] = React.useState<
        Prisma.DocumentGetPayload<typeof documentWithGeneralLedgerArSubledger>[]
    >([])
    const [isCreating, setIsCreating] = React.useState(false)
    // const searchParams = useSearchParams()
    return (
        <>
            <Button onClick={() => setIsCreating(!isCreating)} type="button">
                Create
            </Button>
            {isCreating ? (
                <CreateBillingNote defaultItems={selectItems} />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>เลขที่</TableHead>
                            <TableHead>วันที่</TableHead>
                            <TableHead>จำนวนเงิน</TableHead>
                            <TableHead>สถานะ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((document) => (
                            <TableRow key={document.documentNo}>
                                <TableCell>
                                    <Checkbox
                                        checked={
                                            selectItems.find(
                                                (item) =>
                                                    item.documentNo ===
                                                    document.documentNo
                                            ) && true
                                        }
                                        onCheckedChange={(bool) => {
                                            if (bool) {
                                                setSelectItems([
                                                    ...selectItems,
                                                    document,
                                                ])
                                            }
                                            if (!bool) {
                                                setSelectItems((prev) =>
                                                    prev.filter(
                                                        (item) =>
                                                            item.documentNo !==
                                                            document.documentNo
                                                    )
                                                )
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={`/${document.type === 'Sales' ? 'sales' : 'billing'}/${document.documentNo}`}
                                    >
                                        {document.documentNo}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat('th-TH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                        localeMatcher: 'best fit',
                                    }).format(document.date)}
                                </TableCell>
                                <TableCell>
                                    {document.GeneralLedger[0].amount}
                                </TableCell>
                                <TableCell>
                                    {document.ArSubledger?.paymentStatus}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}
