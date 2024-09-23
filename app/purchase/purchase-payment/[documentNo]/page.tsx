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
import { getSalesBillDefaultFunction } from '@/types/sales-bill/sales-bill'
import { salesBillToSalesBillItems } from '@/types/sales-bill/sales-bill-item'
import { fullDateFormat } from '@/lib/date-format'
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPurchasePaymentDefaultFunction } from '@/types/purchase-payment/purchase-payment'
import { purchasePaymentToPurchasePaymentItems } from '@/types/purchase-payment/purchase-payment-item'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'

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
        title: `รายละเอียดใบวางบิล - ${params.documentNo}`,
    }
}

export default async function PurchasePaymentDetailPage({
    params: { documentNo },
}: Props) {
    const purchasePayment = await getPurchasePaymentDefaultFunction({
        documentNo,
    })

    const purchasePaymentItems = await purchasePaymentToPurchasePaymentItems(
        purchasePayment[0]
    )

    const payments = generalLedgerToPayments(
        purchasePayment[0].PurchasePayment?.GeneralLedger || [],
        { isCash: true },
        true
    )

    return (
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                รายละเอียดใบวางบิล
            </h1>
            <div className="flex items-baseline gap-5">
                <DocumentDetailReadonly
                    documentDetail={{
                        ...purchasePayment[0],
                        contactId:
                            purchasePayment[0].PurchasePayment?.contactId,
                    }}
                    label="ลูกค้า"
                />

                <Link href={`/purchase/purchase-payment/${documentNo}/edit`}>
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
                    {purchasePaymentItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center">
                                {index + 1}
                            </TableCell>
                            <TableCell>{item.documentNo}</TableCell>
                            <TableCell>{item.type}</TableCell>
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
                            {purchasePaymentItems
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
