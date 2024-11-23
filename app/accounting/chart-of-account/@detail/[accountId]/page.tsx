import { getChartOfAccountHistory } from '@/actions/chart-of-account-history'
import prisma from '@/app/db/db'
import UpdateChartOfAccountDialog from '@/components/update-chart-of-account-dialog'
import SelectPagination from '@/components/select-pagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { shortDateFormat } from '@/lib/date-format'

type Props = {
    params: Promise<{ accountId: string }>
    searchParams: Promise<{ accountId: string; page: string }>
}

export default async function page(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams
    const accountDetail = await prisma.chartOfAccount.findUnique({
        where: { id: params.accountId ? +params.accountId : 0 },
        include: { GeneralLedger: { include: {} }, AccountOwner: true },
    })
    const history = await getChartOfAccountHistory(
        +params.accountId,
        +searchParams.page || 1
    )
    const dialogAccountDetail = await prisma.chartOfAccount.findUnique({
        where: { id: searchParams.accountId ? +searchParams.accountId : 0 },
        include: { GeneralLedger: true, AccountOwner: true },
    })
    return (
        <div className="w-[500px]">
            <h1>
                {params.accountId} - {accountDetail?.name}
            </h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>เลขที่</TableHead>
                        <TableHead className="text-right">จำนวนเงิน</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{shortDateFormat(item.date)}</TableCell>
                            <TableCell>{item.documentNo}</TableCell>
                            <TableCell className="text-right">
                                {item.amount.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <SelectPagination count={history.count} />
            {/* <UpdateChartOfAccountDialog
                key={searchParams.accountId}
                account={dialogAccountDetail}
            /> */}
        </div>
    )
}
