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
import { DocumentDetailReadonly } from '@/components/document-detail-readonly'
import UpdateDocumentRemark from '@/components/update-document-remark'

type Props = {
    params: { documentNo: string }
}

export default async function PurchaseOrderDetailPage({
    params: { documentNo },
}: Props) {
    const [document] = await getPurchaseOrderDefaultFunction({ documentNo })
    const session = await getServerSession(authOptions)

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
                        href={`/purchase/purchase-order`}
                        className="text-primary/50 underline hover:text-primary"
                    >{`< ย้อนกลับ`}</Link>
                </div>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดใบสั่งซื้อ
                </h1>
                <div className="flex gap-3">
                    <DocumentDetailReadonly
                        documentDetail={{
                            ...document,
                            contactId: document?.PurchaseOrder?.Contact?.id,
                        }}
                    />
                    {session?.user.role === 'ADMIN' && (
                        <div>
                            <Link
                                href={`/purchase/purchase-order/${document?.documentNo}/edit`}
                            >
                                <Button type="button" variant={'destructive'}>
                                    Edit
                                </Button>
                            </Link>
                        </div>
                    )}
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
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document?.PurchaseOrder?.PurchaseOrderItem.map(
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
                                        {item.costPerUnit}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.costPerUnit * item.quantity}
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
                                        document?.PurchaseOrder?.PurchaseOrderItem.reduce(
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
                            <TableCell colSpan={2}></TableCell>
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