import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Metadata, ResolvingMetadata } from 'next'
import { fullDateFormat } from '@/lib/date-format'
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'
import { getOtherPaymentDefaultFunction } from '@/types/other-payment/other-payment'
import { otherPaymentToOtherPaymentItems } from '@/types/other-payment/other-payment-item'
import { translate } from '@/lib/translate'

type Props = {
    params: {
        documentNo: string
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `ใบสำคัญจ่ายอื่น - ${params.documentNo}`,
    }
}

export default async function OtherPaymentDetailPage({
    params: { documentNo },
}: Props) {
    const otherPayment = await getOtherPaymentDefaultFunction({
        where: { documentNo },
    })

    const otherPaymentItems = await otherPaymentToOtherPaymentItems(
        otherPayment[0]
    )

    const payments = generalLedgerToPayments(
        otherPayment[0].OtherPayment?.GeneralLedger || [],
        { isCash: true },
        true
    )

    return (
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                รายละเอียดใบสำคัญจ่ายอื่น
            </h1>
            <div className="flex items-baseline gap-5">
                <DocumentDetailReadonly
                    documentDetail={{
                        ...otherPayment[0],
                        contactId: otherPayment[0].OtherPayment?.contactId,
                    }}
                    label="เจ้าหนี้"
                />

                <Link href={`/accounting/other-payment/${documentNo}/edit`}>
                    <Button variant={'destructive'}>แก้ไข</Button>
                </Link>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Document No</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherPaymentItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center">
                                {index + 1}
                            </TableCell>
                            <TableCell>{item.documentNo}</TableCell>
                            <TableCell>{translate(item.type)}</TableCell>
                            <TableCell>{fullDateFormat(item.date)}</TableCell>
                            <TableCell className="text-right">
                                {item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableHead className="text-right" colSpan={4}>
                            Total
                        </TableHead>
                        <TableHead className="text-right">
                            {otherPaymentItems
                                .reduce((total, item) => total + item.amount, 0)
                                .toLocaleString()}
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    <TableRow>
                        <TableHead colSpan={5}>
                            <PaymentComponentReadonly payments={payments} />
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
