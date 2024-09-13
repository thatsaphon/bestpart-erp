import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { ResolvingMetadata, Metadata } from 'next'
import { getSalesReturnDefaultFunction } from '@/types/sales-return/sales-return'
import { Table, TableCaption } from '@/components/ui/table'
import CreateOrUpdateSalesReturnInvoiceComponent from '../../create/create-update-sales-return-invoice-component'

type Props = { params: { documentNo: string } }

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `แก้ไขใบรับคืนสินค้า - ${params.documentNo}`,
    }
}

export default async function EditSalesInvoicePage({
    params: { documentNo },
}: Props) {
    const [document] = await getSalesReturnDefaultFunction({
        documentNo,
        type: 'SalesReturn',
    })
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
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-return/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>

                {/* <Link href="/sales/create">
                    <Button
                        variant="ghost"
                        className="mb-2"
                    >{`Create New`}</Button>
                </Link> */}
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขรายละเอียดบิลขาย
            </h1>
            <CreateOrUpdateSalesReturnInvoiceComponent
                existingSalesReturn={document}
                paymentMethods={paymentMethods}
                defaultPayments={document.SalesReturn?.GeneralLedger.filter(
                    (gl) => gl.ChartOfAccount.isAr || gl.ChartOfAccount.isCash
                ).map((x) => ({
                    id: x.chartOfAccountId,
                    amount: x.amount,
                }))}
                defaultRemarks={document.DocumentRemark}
            />
        </>
    )
}
