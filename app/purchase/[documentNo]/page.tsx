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
import { getPurchaseInvoiceDetail } from '@/app/actions/purchase/purchase-invoice-detail'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import SelectSearchVendor from '../../../components/select-search-vendor'

type Props = {
    params: { documentNo: string }
}

export default async function PurchaseInvoiceDetailPage({
    params: { documentNo },
}: Props) {
    const document = await getPurchaseInvoiceDetail(documentNo)
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
                        href={`/purchase`}
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
                                href={`/purchase/${document?.documentNo}/edit`}
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
                                document?.ApSubledger?.Contact.id + ''
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
                <Table className="mt-3">
                    <TableCaption>
                        <Textarea
                            defaultValue={document?.remark
                                .map(({ remark }) => remark)
                                .join('\n')}
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
                        {document?.SkuIn.map((item) => (
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
                                <TableCell className="text-right">{`${item.unit}(${item.quantity})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.cost + item.vat}
                                </TableCell>
                                <TableCell className="text-right">
                                    {(item.cost + item.vat) * item.quantity}
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
                                        document?.GeneralLedger.find(
                                            (item) =>
                                                item.chartOfAccountId ===
                                                    11000 ||
                                                item.chartOfAccountId === 21000
                                        )?.amount
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
