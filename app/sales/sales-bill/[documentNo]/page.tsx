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
import BillInvoiceLinkComponent from './bill-invoice-link-component'
import UpdateDocumentRemark from '@/components/update-document-remark'

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
    const billingNote = await getSalesBillDefaultFunction({
        documentNo,
    })

    const salesBillItems = await salesBillToSalesBillItems(billingNote[0])

    return (
        <div className="p-3">
            <h1 className="my-2 text-3xl transition-colors">
                รายละเอียดใบวางบิล
            </h1>
            <div className="flex items-baseline gap-5">
                <DocumentDetailReadonly
                    documentDetail={{
                        ...billingNote[0],
                        contactId: billingNote[0].SalesBill?.contactId,
                    }}
                    label="ลูกค้า"
                />

                <Link href={`/sales/sales-bill/${documentNo}/edit`}>
                    <Button variant={'destructive'}>แก้ไข</Button>
                </Link>
                <BillInvoiceLinkComponent document={billingNote[0]} />
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
                    {salesBillItems.map((item, index) => (
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
                            {salesBillItems
                                .reduce((total, item) => total + item.amount, 0)
                                .toLocaleString()}
                        </TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4} className="space-x-1 text-right">
                            <UpdateDocumentRemark
                                existingDocumentRemark={
                                    billingNote[0].DocumentRemark
                                }
                                documentId={billingNote[0].id}
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
