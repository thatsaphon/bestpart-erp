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
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { getApPaymentMethods } from '@/app/actions/accounting'
import SelectSearchCustomer from '@/components/select-search-customer'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getOtherInvoiceDetail } from './getOtherInvoiceDetail'
import SelectSearchVendor from '@/components/select-search-vendor'
import { updateRemark } from '@/app/sales/[documentNo]/update-remarks'
import EditOtherInvoicePaymentsComponents from './edit-other-invoice-payments-components'
import DeleteOtherInvoiceButton from './delete-other-invoice-button'

type Props = {
    params: { documentNo: string }
}

export default async function OtherInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const document = await getOtherInvoiceDetail(documentNo)
    const session = await getServerSession(authOptions)
    const paymentMethods = await getApPaymentMethods()

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
                    href={'/accounting/other-invoice'}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดบิล
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

                        {session?.user.role === 'ADMIN' && (
                            <div>
                                <DeleteOtherInvoiceButton
                                    documentNo={documentNo}
                                />
                            </div>
                        )}
                    </div>
                    {/* <Suspense fallback={<div>Loading...</div>}>
                    </Suspense> */}
                    {/* <BlobProviderClient
                        key={new Date().getTime()}
                        document={document}
                        documentType={'SalesInvoicePdf_5x9'}
                    /> */}
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchVendor
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.ApSubledger?.Contact.id || ''
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
                            <EditOtherInvoicePaymentsComponents
                                document={document}
                                paymentMethods={paymentMethods}
                            />

                            <p className="text-left font-bold text-primary">
                                หมายเหตุ:
                            </p>
                            {document?.remark.map((remark) => (
                                <p
                                    className={cn(
                                        'text-left text-primary',
                                        remark.isDeleted &&
                                            'text-primary/50 line-through'
                                    )}
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
                            <TableHead>เลชบัญชี</TableHead>
                            <TableHead>ชื่อบัญชี</TableHead>
                            <TableHead className="text-right">
                                จำนวนเงิน
                            </TableHead>
                            <TableHead className="text-right">
                                ชื่อสินทรัพย์
                            </TableHead>
                            <TableHead className="text-right">
                                อายุการใช้งาน
                            </TableHead>
                            <TableHead className="text-right">
                                มูลค่าคงเหลือ
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.GeneralLedger.filter(
                            ({ chartOfAccountId }) =>
                                !paymentMethods
                                    .map(({ id }) => id)
                                    .includes(chartOfAccountId)
                        ).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.chartOfAccountId}</TableCell>
                                <TableCell>
                                    {item.ChartOfAccount.name}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.amount}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.AssetMovement?.AssetRegistration.name}
                                </TableCell>
                                <TableCell className="text-right">
                                    {
                                        item.AssetMovement?.AssetRegistration
                                            .usefulLife
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    {
                                        item.AssetMovement?.AssetRegistration
                                            .residualValue
                                    }
                                </TableCell>
                                {/* <TableCell className="text-right">
                                    {(item.price + item.vat) * item.quantity}
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    Number(
                                        document?.GeneralLedger.filter(
                                            (item) =>
                                                !paymentMethods
                                                    .map(({ id }) => id)
                                                    .includes(
                                                        item.chartOfAccountId
                                                    )
                                        )?.reduce((a, b) => a + b.amount, 0)
                                    )
                                )}
                            </TableCell>
                            <TableCell colSpan={3}></TableCell>
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
