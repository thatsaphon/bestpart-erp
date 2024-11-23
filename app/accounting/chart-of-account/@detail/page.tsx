import prisma from '@/app/db/db'
import UpdateChartOfAccountDialog from '@/components/update-chart-of-account-dialog'
import React from 'react'

type Props = { searchParams: Promise<{ accountId: string }> }

export default async function page(props: Props) {
    const searchParams = await props.searchParams
    const accountDetail = await prisma.chartOfAccount.findUnique({
        where: { id: searchParams.accountId ? +searchParams.accountId : 0 },
        include: { GeneralLedger: true, AccountOwner: true },
    })
    return (
        <div>
            {/* <UpdateChartOfAccountDialog
                key={searchParams.accountId}

                account={accountDetail}
            /> */}
        </div>
    )
}
