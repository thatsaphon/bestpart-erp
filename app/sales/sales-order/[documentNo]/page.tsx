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
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { getPaymentMethods } from '@/app/actions/accounting'
import EditPaymentsComponents from './edit-payments-components'
import { updateRemark } from './update-remarks'
import SelectSearchCustomer from '@/components/select-search-customer'
import { cn } from '@/lib/utils'
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
                <Link
                    href={'/sales/sales-order'}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
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
                                    href={`/sales/sales-order/${document?.documentNo}/edit`}
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
                    <SalesInvoiceLinkComponent document={document} />
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.Sales?.contactId || ''
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
                            {/* <EditPaymentsComponents
                                document={document}
                                paymentMethods={paymentMethods}
                            /> */}

                            <p className="text-left font-bold text-primary">
                                หมายเหตุ:
                            </p>
                            {/* {document?.remark.map((remark) => (
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
                            ))} */}
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
                        {document?.Sales?.SalesItem.map((item) => (
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
