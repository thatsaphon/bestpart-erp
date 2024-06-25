import Link from 'next/link'
import React from 'react'
import CreateUpdateOtherExpenseComponent from './create-update-other-expense'
import prisma from '@/app/db/db'

type Props = {}

export default async function CreateOtherExpensePage({}: Props) {
    const otherExpenses = await prisma.chartOfAccount.findMany({
        where: {
            type: { in: ['Assets', 'Expense', 'OtherExpense'] },
            AND: [{ id: { gt: 14000 } }, { id: { not: 15100 } }],
        },
        orderBy: { id: 'asc' },
    })
    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/accounting/payment`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>
            </div>
            <h1 className="my-2 text-2xl transition-colors">
                บันทึกบิลค่าใช้จ่ายใหม่
            </h1>
            <CreateUpdateOtherExpenseComponent
                chartOfAccounts={otherExpenses}
            />
        </>
    )
}
