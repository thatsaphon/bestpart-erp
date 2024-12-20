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
// import PurchaseInvoiceLinkComponent from './purchase-invoice-link-component'
import { Metadata, ResolvingMetadata } from 'next'
import { getPurchaseReturnDefaultFunction } from '@/types/purchase-return/purchase-return'
import UpdateDocumentRemark from '@/components/update-document-remark'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'
import DocumentItemFooterReadonly from '@/components/document-item-footer-readonly'
import { PurchaseReturnItemsToDocumentItems } from '@/types/purchase-return/purchase-return-item'

type Props = {
    params: Promise<{ documentNo: string }>
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const params = await props.params;
    return {
        title: `รายละเอียดใบลดหนี้/ใบคืนสินค้า - ${params.documentNo}`,
    }
}

export default async function PurchaseInvoiceDetailPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    const [document] = await getPurchaseReturnDefaultFunction({
        documentNo,
        type: 'PurchaseReturn',
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
                    รายละเอียดใบลดหนี้/ใบคืนสินค้า
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
                                    href={`/purchase/purchase-return/${document?.documentNo}/edit`}
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
                    {/* <PurchaseInvoiceLinkComponent document={document} /> */}
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.PurchaseReturn?.contactId || ''
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
                        {document?.PurchaseReturn?.PurchaseReturnItem.map(
                            (item) => (
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
                                        {item.costPerUnitIncVat}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.costPerUnitIncVat * item.quantity}
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <DocumentItemFooterReadonly
                            documentItems={PurchaseReturnItemsToDocumentItems(
                                document?.PurchaseReturn?.PurchaseReturnItem
                            )}
                            isIncludeVat={
                                document.PurchaseReturn?.PurchaseReturnItem[0]
                                    ?.isIncludeVat ?? true
                            }
                            vatable={
                                document.PurchaseReturn?.PurchaseReturnItem[0]
                                    ?.vatable ?? true
                            }
                        />
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
                            </TableCell>
                            <TableCell
                                colSpan={2}
                                className="space-x-1 text-right"
                            >
                                <PaymentComponentReadonly
                                    payments={generalLedgerToPayments(
                                        document?.PurchaseReturn
                                            ?.GeneralLedger || [],
                                        {
                                            isCash: false,
                                            isAp: true,
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
