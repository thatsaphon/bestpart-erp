import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
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
import { purchaseItemsToDocumentItems } from '@/types/purchase/purchase-item'
import DocumentItemFooterReadonly from '@/components/document-item-footer-readonly'
import { getPurchaseDefaultFunction } from '@/types/purchase/purchase'
import { notFound } from 'next/navigation'
import UpdateDocumentRemark from '@/components/update-document-remark'

type Props = {
    params: { documentNo: string }
}

export default async function PurchaseInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const [document] = await getPurchaseDefaultFunction({ documentNo })
    if (!document) return notFound()
    const session = await getServerSession(authOptions)

    const purchaseOrders = await getPurchaseOrderDefaultFunction({
        id: {
            in: document?.Purchase?.PurchaseOrder.map(
                (purchaseOrder) => purchaseOrder.documentId
            ),
        },
    })

    return (
        <>
            <div className="mb-2 p-3">
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
                    <TableHeader>
                        <TableRow>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="text-right">หน่วย</TableHead>
                            <TableHead className="text-right">
                                ราคาต่อหน่วย
                            </TableHead>
                            <TableHead className="text-right">ส่วนลด</TableHead>
                            <TableHead className="text-right">
                                หลังหักส่วนลด
                            </TableHead>
                            <TableHead className="text-right">รวม</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.Purchase?.PurchaseItem.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>{item.name}</p>
                                    <p className="text-primary/50">
                                        {item.description}
                                    </p>

                                    {/* <p>{item.SkuMaster?.detail}</p> */}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">{`${item.unit}(${item.quantity})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.isIncludeVat
                                        ? item.costPerUnitIncVat
                                        : item.costPerUnitExVat}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.discountString}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.isIncludeVat
                                        ? item.costPerUnitIncVat -
                                          (item.discountPerUnitIncVat || 0)
                                        : item.costPerUnitExVat -
                                          (item.discountPerUnitExVat || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.isIncludeVat
                                        ? (item.costPerUnitIncVat -
                                              (item.discountPerUnitIncVat ||
                                                  0)) *
                                          item.quantity
                                        : (item.costPerUnitExVat -
                                              (item.discountPerUnitExVat ||
                                                  0)) *
                                          item.quantity}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <DocumentItemFooterReadonly
                            documentItems={purchaseItemsToDocumentItems(
                                document?.Purchase?.PurchaseItem
                            )}
                            isIncludeVat={
                                document.Purchase?.PurchaseItem[0]
                                    ?.isIncludeVat ?? true
                            }
                            vatable={
                                document.Purchase?.PurchaseItem[0]?.vatable ??
                                true
                            }
                            colSpan={8}
                        />
                        <TableRow>
                            <TableCell colSpan={7} className="text-right">
                                <UpdateDocumentRemark
                                    documentId={document.id}
                                    existingDocumentRemark={
                                        document.DocumentRemark
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </>
    )
}
