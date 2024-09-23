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
import { getSalesReceivedDefaultFunction } from '@/types/sales-received/sales-receive'
import { salesReceiveToSalesReceiveItems } from '@/types/sales-received/sales-receive-item'
import PaymentComponentReadonly from '@/components/payment-component-readonly'

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

export default async function page({ params: { documentNo } }: Props) {
    const salesReceived = await getSalesReceivedDefaultFunction({
        documentNo,
    })

    const salesReceivedItems = await salesReceiveToSalesReceiveItems(
        salesReceived[0]
    )

    const payments =
        salesReceived[0].SalesReceived?.GeneralLedger.filter(
            ({ ChartOfAccount: { isCash, isDeposit } }) => isCash || isDeposit
        ).map(({ chartOfAccountId, amount, ChartOfAccount: { name } }) => ({
            chartOfAccountId,
            amount,
            name,
        })) || []

    return (
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                รายละเอียดใบวางบิล
            </h1>
            <div className="flex items-baseline gap-5">
                <DocumentDetailReadonly
                    documentDetail={{
                        ...salesReceived[0],
                        contactId: salesReceived[0].SalesReceived?.contactId,
                    }}
                    label="ลูกค้า"
                />

                <Link href={`/sales/sales-received/${documentNo}/edit`}>
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
                    {salesReceivedItems.map((item, index) => (
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
                            {salesReceivedItems
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
