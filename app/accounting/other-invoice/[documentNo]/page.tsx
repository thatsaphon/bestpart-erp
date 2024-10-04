import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

import { getApPaymentMethods } from '@/app/actions/accounting'
import { getOtherInvoiceDefaultFunction } from '@/types/other-invoice/other-invoice'
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'
import UpdateDocumentRemark from '@/components/update-document-remark'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DocumentItemFooterReadonly from '@/components/document-item-footer-readonly'
import { otherInvoiceItemToDocumentItem } from '@/types/other-invoice/other-invoice-item'

type Props = {
    params: { documentNo: string }
}

export default async function OtherInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const [document] = await getOtherInvoiceDefaultFunction({ documentNo })
    const session = await getServerSession(authOptions)
    const paymentMethods = await getPaymentMethods()

    if (!document)
        return (
            <>
                <Table>
                    <TableCaption>ไม่พบข้อมูล</TableCaption>
                </Table>
            </>
        )

    return (
        <>
            <div className="mb-2 p-3">
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดบิล
                </h1>
                <div className="flex items-baseline gap-3">
                    <DocumentDetailReadonly
                        documentDetail={{
                            ...document,
                            contactId: document.OtherInvoice?.contactId,
                        }}
                    />
                    <Link
                        href={
                            '/accounting/other-invoice/' + documentNo + '/edit'
                        }
                    >
                        <Button type="button" variant={'destructive'}>
                            แก้ไข
                        </Button>
                    </Link>
                </div>
                <Table className="mt-3">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อรายการ</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                            <TableHead className="text-right">จำนวน</TableHead>
                            <TableHead className="text-right">หน่วย</TableHead>
                            <TableHead className="text-right">
                                ราคาต่อหน่วย
                            </TableHead>
                            <TableHead className="text-right">รวม</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document.OtherInvoice?.OtherInvoiceItem.map(
                            (item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.unit}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.costPerUnitIncVat.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(
                                            item.costPerUnitIncVat *
                                            item.quantity
                                        ).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <DocumentItemFooterReadonly
                            documentItems={otherInvoiceItemToDocumentItem(
                                document?.OtherInvoice?.OtherInvoiceItem
                            )}
                            isIncludeVat={
                                document?.OtherInvoice?.OtherInvoiceItem[0]
                                    ?.isIncludeVat === undefined
                                    ? true
                                    : document?.OtherInvoice
                                          ?.OtherInvoiceItem[0]?.isIncludeVat
                            }
                            vatable={
                                document?.OtherInvoice?.OtherInvoiceItem[0]
                                    ?.isIncludeVat === undefined
                                    ? true
                                    : document?.OtherInvoice
                                          ?.OtherInvoiceItem[0]?.isIncludeVat
                            }
                        />
                        <TableRow>
                            <TableCell colSpan={3}>
                                <UpdateDocumentRemark
                                    existingDocumentRemark={
                                        document.DocumentRemark
                                    }
                                    documentId={document.id}
                                />
                            </TableCell>
                            <TableCell
                                colSpan={3}
                                className="space-x-1 text-right"
                            >
                                <PaymentComponentReadonly
                                    payments={generalLedgerToPayments(
                                        document.OtherInvoice?.GeneralLedger ||
                                            [],
                                        { isCash: true, isAp: true },
                                        true
                                    )}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    )
}
