import React from 'react'

import prisma from '@/app/db/db'
import AssetTypeToChartOfAccountSetup from './asset-type-to-chart-of-account-setup'

type Props = {}

export default async function OtherInvoiceSetup({}: Props) {
    const chartOfAccounts = await prisma.chartOfAccount.findMany({
        where: {
            type: {
                in: ['Assets'],
            },
        },
        include: {
            AssetTypeToChartOfAccount: true,
        },
    })

    return (
        <div className="p-3">
            <h2 className="mb-2 text-2xl transition-colors">
                Other Invoice Asset Setup
            </h2>
            <AssetTypeToChartOfAccountSetup chartOfAccounts={chartOfAccounts} />
        </div>
    )
}
