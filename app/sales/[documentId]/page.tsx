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
import { Textarea } from '../../../components/ui/textarea'
import { Button } from '../../../components/ui/button'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import SelectSearchVendor from '../../../components/select-search-vendor'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import BlobProviderClient from './blob-provider'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getPaymentMethods } from '@/app/actions/accounting'
import EditPaymentsComponents from './edit-payments-components'
import { updateRemark } from './update-remarks'

type Props = {
    params: { documentId: string }
}

export default async function PurchaseInvoiceDetailPage({
    params: { documentId },
}: Props) {
    const document = await getSalesInvoiceDetail(documentId)
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
                                defaultValue={document?.documentId}
                                disabled
                            />
                        </div>

                        {session?.user.role === 'ADMIN' && (
                            <div>
                                <Link
                                    href={`/sales/${document?.documentId}/edit`}
                                >
                                    <Button
                                        type="button"
                                        variant={'destructive'}
                                    >
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                    <BlobProviderClient document={document} />
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchVendor
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.ArSubledger?.Contact.id || ''
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
                    <TableCaption>
                        <div className="w-[600px] space-y-1">
                            <EditPaymentsComponents
                                document={document}
                                paymentMethods={paymentMethods}
                            />

                            <p className="text-left">หมายเหตุ:</p>
                            {document?.remark.map((remark) => (
                                <p
                                    className="text-left text-primary"
                                    key={remark.id}
                                >
                                    {remark.remark}
                                </p>
                            ))}
                            <form
                                className="grid grid-cols-[500px_1fr] items-center gap-1"
                                action={async (formData) => {
                                    'use server'
                                    const remark = formData.get('remark')
                                    if (!remark || typeof remark !== 'string')
                                        return

                                    await updateRemark(document.id, remark)
                                }}
                            >
                                <Input name="remark" />
                                <Button className="">เพิ่มหมายเหตุ</Button>
                            </form>
                        </div>
                    </TableCaption>
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
                        {document?.SkuOut.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>
                                        {
                                            item.GoodsMaster.SkuMaster.mainSku
                                                .name
                                        }
                                    </p>
                                    <p>{item.GoodsMaster.SkuMaster.detail}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">{`${item.unit}(${item.quantityPerUnit})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.price + item.vat}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(item.price + item.vat) * item.quantity}
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
                                        document?.GeneralLedger.filter(
                                            (item) =>
                                                item.chartOfAccountId >=
                                                    11000 &&
                                                item.chartOfAccountId <= 12000
                                        )?.reduce((a, b) => a + b.amount, 0)
                                    )
                                )}
                            </TableCell>
                        </TableRow>
                        <TableRow className="bg-background">
                            <TableCell
                                colSpan={6}
                                className="space-x-1 text-right"
                            ></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    )
}
