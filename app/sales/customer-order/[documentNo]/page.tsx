import { getPaymentMethods } from '@/actions/get-payment-methods'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearchCustomer from '@/components/select-search-customer'
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
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import getCustomerOrderDetail from './get-customer-order-detail'
import CustomerOrderLinkComponent from './customer-order-link-component'

type Props = {
    params: {
        documentNo: string
    }
}

export default async function CustomerOrderDetailPage({
    params: { documentNo },
}: Props) {
    const document = await getCustomerOrderDetail(documentNo)
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
                    href={'/sales/customer-order'}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดใบจองสินค้า
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

                        <div>
                            <Link
                                href={`/sales/customer-order/${document?.documentNo}/edit`}
                            >
                                <Button type="button" variant={'destructive'}>
                                    แก้ไข
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <CustomerOrderLinkComponent document={document} />
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.CustomerOrder?.Contact.id || ''
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
                        {document?.CustomerOrder?.CustomerOrderItem.map(
                            (item) => (
                                <TableRow key={item.barcode}>
                                    <TableCell>{item.barcode}</TableCell>
                                    <TableCell>
                                        <p>{item?.description}</p>
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
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5} className="text-right">
                                Total
                            </TableCell>
                            <TableCell className="text-right">
                                {Math.abs(
                                    Number(
                                        document?.CustomerOrder?.CustomerOrderItem.reduce(
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
