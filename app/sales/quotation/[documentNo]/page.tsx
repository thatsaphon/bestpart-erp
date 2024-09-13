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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import getQuotationDetail from './get-quotation-detail'
import QuotationLinkComponent from './quotation-link-component'
import UpdateDocumentRemark from '@/components/update-document-remark'
// import { updateRemark } from '../../sales-return/[documentNo]/update-remarks'

type Props = {
    params: {
        documentNo: string
    }
}

export default async function QuotationDetailPage({
    params: { documentNo },
}: Props) {
    const document = await getQuotationDetail(documentNo)

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
                    href={'/sales/quotation'}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
                <h1 className="my-2 text-3xl transition-colors">
                    รายละเอียดใบเสนอราคา
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
                                href={`/sales/quotation/${document?.documentNo}/edit`}
                            >
                                <Button type="button" variant={'destructive'}>
                                    แก้ไข
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <QuotationLinkComponent document={document} />
                </div>
                <div className="flex gap-3">
                    <div className="my-1 flex items-baseline space-x-2">
                        <Label>ลูกค้า</Label>
                        <SelectSearchCustomer
                            name={'customerId'}
                            hasTextArea={true}
                            // placeholder="Optional"
                            defaultValue={String(
                                document?.Quotation?.Contact?.id || ''
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
                        {document?.Quotation?.QuotationItem.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell>
                                    <p>
                                        {
                                            item?.GoodsMaster?.SkuMaster.MainSku
                                                .name
                                        }
                                    </p>
                                    <p>{item?.GoodsMaster?.SkuMaster.detail}</p>
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
                                        document?.Quotation?.QuotationItem.reduce(
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
