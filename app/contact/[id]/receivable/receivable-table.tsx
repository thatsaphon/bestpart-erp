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
import { Badge } from '@/components/ui/badge'
import { fullDateFormat } from '@/lib/date-format'

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
                            <TableHead className="text-center">สถานะ</TableHead>
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
                                        href={`/${
                                            document.documentNo.startsWith(
                                                'INV'
                                            )
                                                ? 'sales'
                                                : document.documentNo.startsWith(
                                                        'CN'
                                                    )
                                                  ? 'sales/sales-return'
                                                  : 'sales/sales-bill'
                                        }/${document.documentNo}`}
                                    >
                                        {document.documentNo}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {fullDateFormat(document.date)}
                                </TableCell>
                                <TableCell>
                                    {document.GeneralLedger?.reduce(
                                        (acc, curr) => acc + curr.amount,
                                        0
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    {/* {document.ArSubledger?.paymentStatus} */}
                                    {document.ArSubledger?.paymentStatus ===
                                    'Billed' ? (
                                        <Badge className="bg-green-500">
                                            วางบิลแล้ว
                                        </Badge>
                                    ) : document.documentNo.startsWith('CN') &&
                                      document.ArSubledger?.paymentStatus ===
                                          'Paid' ? (
                                        <Badge className="bg-green-500">
                                            คืนเงินแล้ว
                                        </Badge>
                                    ) : document.ArSubledger?.paymentStatus ===
                                      'Paid' ? (
                                        <Badge className="bg-green-500">
                                            จ่ายแล้ว
                                        </Badge>
                                    ) : document.ArSubledger?.paymentStatus ===
                                      'PartialPaid' ? (
                                        <Badge variant={'destructive'}>
                                            จ่ายแล้วบางส่วน
                                        </Badge>
                                    ) : document.documentNo.startsWith('CN') &&
                                      document.ArSubledger?.paymentStatus ===
                                          'NotPaid' ? (
                                        <Badge className="bg-yellow-400">
                                            ยังไม่ได้คืนเงิน
                                        </Badge>
                                    ) : (
                                        <Badge variant={'destructive'}>
                                            ยังไม่จ่าย
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}
