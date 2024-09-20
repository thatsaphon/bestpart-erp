import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { updateRemark } from './update-remarks'
import SelectSearchCustomer from '@/components/select-search-customer'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { isBefore, startOfDay } from 'date-fns'
import SalesInvoiceLinkComponent from './sales-invoice-link-component'
import { Metadata, ResolvingMetadata } from 'next'
import { getSalesDefaultFunction } from '@/types/sales/sales'
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'
import UpdateDocumentRemark from '@/components/update-document-remark'

type Props = {
    params: { documentNo: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `รายละเอียดบิลขาย - ${params.documentNo}`,
    }
}

export default async function SalesInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const [document] = await getSalesDefaultFunction({
        documentNo,
        type: 'Sales',
    })

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
                <Link
                    href={'/sales/sales-order'}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดบิลขาย
                </h1>
                <div className="flex justify-between pr-4">
                    <div className="flex items-baseline gap-2">
                        <DocumentDetailReadonly
                            documentDetail={{
                                ...document,
                                contactId: document?.Sales?.contactId,
                            }}
                        />
                        {isBefore(
                            startOfDay(document?.date),
                            startOfDay(new Date())
                        ) ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="disabled:pointer-events-auto"
                                            disabled
                                        >
                                            แก้ไข
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>ไม่สามารถแก้ไขย้อนหลังได้</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Link
                                href={`/sales/sales-order/${documentNo}/edit`}
                            >
                                <Button
                                    variant="destructive"
                                    className="disabled:pointer-events-auto"
                                >
                                    แก้ไข
                                </Button>
                            </Link>
                        )}
                    </div>
                    <SalesInvoiceLinkComponent document={document} />
                </div>
                <Table className="mt-3">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.Sales?.SalesItem.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>{item.name}</p>
                                    <p>{item.description}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">{`${item.unit}(${item.quantityPerUnit})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.pricePerUnit}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.pricePerUnit * item.quantity}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    Number(
                                        document?.Sales?.SalesItem.reduce(
                                            (a, b) =>
                                                a + b.pricePerUnit * b.quantity,
                                            0
                                        )
                                    )
                                )}
                            </TableCell>
                        </TableRow>
                        <TableRow className="bg-background">
                            <TableCell
                                colSpan={4}
                                className="space-x-1 text-right"
                            >
                                <UpdateDocumentRemark
                                    existingDocumentRemark={
                                        document?.DocumentRemark
                                    }
                                    documentId={document?.id}
                                />
                                {/* <PaymentComponentReadonly
                                    payments={generalLedgerToPayments(
                                        document?.Sales?.GeneralLedger || [],
                                        true
                                    )}
                                /> */}
                            </TableCell>
                            <TableCell
                                colSpan={2}
                                className="space-x-1 text-right"
                            >
                                <PaymentComponentReadonly
                                    payments={generalLedgerToPayments(
                                        document?.Sales?.GeneralLedger || [],
                                        {
                                            isCash: true,
                                            isAr: true,
                                            isDeposit: true,
                                        }
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
