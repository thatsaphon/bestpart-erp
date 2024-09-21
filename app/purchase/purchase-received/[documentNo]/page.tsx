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
import { Textarea } from '../../../../components/ui/textarea'
import { Button } from '../../../../components/ui/button'
import { getPurchaseInvoiceDetail } from '@/app/actions/purchase/purchase-invoice-detail'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import SelectSearchVendor from '../../../../components/select-search-vendor'
import { getPurchaseOrderDefaultFunction } from '@/types/purchase-order/purchase-order'
import PurchaseOrderHoverCard from '@/components/purchase-order-hover-card'

type Props = {
    params: { documentNo: string }
}

export default async function PurchaseInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const document = await getPurchaseInvoiceDetail(documentNo)
    const session = await getServerSession(authOptions)

    const purchaseOrders = await getPurchaseOrderDefaultFunction({
        id: {
            in: document?.Purchase?.PurchaseOrder.map(
                (purchaseOrder) => purchaseOrder.documentId
            ),
        },
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
                <div className="flex justify-between">
                    <Link
                        href={`/purchase/purchase-received`}
                        className="text-primary/50 underline hover:text-primary"
                    >{`< ย้อนกลับ`}</Link>
                </div>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดบิลซื้อ
                </h1>
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
                            <Link
                                href={`/purchase/purchase-received/${document?.documentNo}/edit`}
                            >
                                <Button type="button" variant={'destructive'}>
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>คู่ค้า</Label>
                        <SelectSearchVendor
                            name={'vendorId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={
                                document?.Purchase?.Contact?.id + '' || ''
                            }
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
                <div>
                    ใบสั่งซื้อ{' '}
                    {purchaseOrders.map((purchaseOrder) => (
                        <PurchaseOrderHoverCard
                            key={purchaseOrder.id}
                            purchaseOrder={purchaseOrder}
                        />
                    ))}
                </div>
                <Table className="mt-3">
                    <TableCaption>
                        <Textarea
                            defaultValue={document?.DocumentRemark.map(
                                ({ remark }) => remark
                            ).join('\n')}
                        />
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
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.Purchase?.PurchaseItem.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>{item.SkuMaster?.MainSku.name}</p>
                                    <p>{item.SkuMaster?.detail}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">{`${item.unit}(${item.quantity})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.costPerUnit}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.costPerUnit * item.quantity}
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
                                        document?.Purchase?.PurchaseItem.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.costPerUnit *
                                                    item.quantity,
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
