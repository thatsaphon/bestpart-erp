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
import CustomerOrderComponent from './customer-order-link-component'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'
import UpdateDocumentRemark from '@/components/update-document-remark'
import PaymentComponentReadonly from '@/components/payment-component-readonly'
import { generalLedgerToPayments } from '@/types/payment/payment'
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import CustomerOrderStatusBadge from '../customer-order-status-badge'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { customerOrderStatus } from '@/types/customer-order/customer-order-status'
import { updateCustomerOrderStatus } from './update-customer-order-status'
import { CustomerOrderStatus } from '@prisma/client'

type Props = {
    params: Promise<{
        documentNo: string
    }>
}

export default async function CustomerOrderDetailPage(props: Props) {
    const params = await props.params;

    const {
        documentNo
    } = params;

    // const document = await getCustomerOrderDetail(documentNo)
    const [document] = await getCustomerOrderDefaultFunction({
        documentNo,
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
                    รายละเอียดใบจองสินค้า
                </h1>
                <DocumentDetailReadonly
                    label="ลูกค้า"
                    documentDetail={{
                        ...document,
                        contactId: document?.CustomerOrder?.Contact?.id,
                    }}
                />
                {document?.CustomerOrder && (
                    <div className="flex items-baseline gap-2 p-3">
                        <CustomerOrderStatusBadge
                            status={document?.CustomerOrder?.status}
                        />

                        {!!document.CustomerOrder.PurchaseOrder.length && (
                            <div>ใบสั่งซื้อ</div>
                        )}
                        {!!document.CustomerOrder.SalesLink.length && (
                            <div>บิลขาย</div>
                        )}
                    </div>
                )}
                <form
                    action={async (formData) => {
                        'use server'
                        if (!document.CustomerOrder) return

                        const status = formData.get(
                            'status'
                        ) as CustomerOrderStatus
                        await updateCustomerOrderStatus(
                            document.CustomerOrder?.id,
                            status
                        )
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Label>เปลี่ยนสถานะ</Label>

                        <Select
                            defaultValue={document?.CustomerOrder?.status}
                            name="status"
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.entries(customerOrderStatus).map(
                                        ([status, statusName]) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                {statusName}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Button type="submit">บันทึก</Button>
                    </div>
                </form>
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
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="space-x-1 text-right"
                            >
                                <UpdateDocumentRemark
                                    existingDocumentRemark={
                                        document.DocumentRemark
                                    }
                                    documentId={document.id}
                                />
                            </TableCell>
                            <TableCell colSpan={2}>
                                <PaymentComponentReadonly
                                    payments={generalLedgerToPayments(
                                        document.CustomerOrder?.GeneralLedger ||
                                            [],
                                        { isCash: true }
                                    )}
                                />
                            </TableCell>
                        </TableRow>

                        <TableRow>
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
