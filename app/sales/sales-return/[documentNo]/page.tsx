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
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import SelectSearchCustomer from '@/components/select-search-customer'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { isBefore, startOfDay } from 'date-fns'
// import SalesInvoiceLinkComponent from './sales-invoice-link-component'
import { Metadata, ResolvingMetadata } from 'next'
import { getSalesReturnDefaultFunction } from '@/types/sales-return/sales-return'
import UpdateDocumentRemark from '@/components/update-document-remark'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'

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
    const [document] = await getSalesReturnDefaultFunction({
        documentNo,
        type: 'SalesReturn',
    })
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
                    รายละเอียดบิลขาย
                </h1>
                <div className="flex justify-between pr-4">
                    <div className="flex gap-3">
                        <div className="space-x-2">
                            <Label>วันที่</Label>
                            <DatePickerWithPresets
                                defaultDate={document?.date}
                                disabled
                            />
                        </div>
                        <div className="space-x-2">
                            <Label>No.</Label>
                            <Input
                                className="w-auto"
                                placeholder="Optional"
                                defaultValue={document?.documentNo}
                                disabled
                            />
                        </div>

                        {!isBefore(
                            startOfDay(document?.date),
                            startOfDay(new Date())
                        ) ? (
                            <div>
                                <Link
                                    href={`/sales/sales-return/${document?.documentNo}/edit`}
                                >
                                    <Button
                                        type="button"
                                        variant={'destructive'}
                                    >
                                        แก้ไข
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            disabled
                                            className="disabled:pointer-events-auto"
                                        >
                                            แก้ไข
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>ไม่สามารถแก้ไขย้อนหลังได้</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {/* <SalesInvoiceLinkComponent document={document} /> */}
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.SalesReturn?.contactId || ''
                            )}
                            defaultAddress={{
                                name: document?.contactName || '',
                                address: document?.address || '',
                                phone: document?.phone || '',
                                taxId: document?.taxId || '',
                            }}
                            disabled
                        />
                    </div>
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
                        {document?.SalesReturn?.SalesReturnItem.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>{item.SkuMaster?.MainSku.name}</p>
                                    <p>{item.SkuMaster?.detail}</p>
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
                                        document?.SalesReturn?.SalesReturnItem.reduce(
                                            (a, b) =>
                                                a + b.pricePerUnit * b.quantity,
                                            0
                                        )
                                    )
                                )}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="space-x-1 text-right"
                            ></TableCell>
                        </TableRow>
                        <TableRow>
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
                                        document?.SalesReturn?.GeneralLedger ||
                                            [],
                                        {
                                            isCash: true,
                                            isAr: true,
                                            isDeposit: true,
                                        },
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
