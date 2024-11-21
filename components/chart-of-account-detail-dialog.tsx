'use client'

import React, { useActionState, useEffect } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from './ui/select'
import {
    createChartOfAccounts,
    deleteChartOfAccount,
} from '@/app/actions/accounting'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChartOfAccount, DocumentType } from '@prisma/client'
import { deleteKeyFromQueryString } from '@/lib/searchParams'
import getChartOfAccountDetail from '@/app/accounting/get-chart-of-account-detail'
import { translate } from '@/lib/translate'

type Props = {
    className?: string
    label?: string
    account:
        | (ChartOfAccount & {
              AccountOwner: {
                  id: number
                  chartOfAccountId: number
                  userId: string
              }[]
              GeneralLedger: {
                  id: number
                  amount: number
              }[]
          })
        | null
}
export default function ChartOfAccountDetailDialog({
    className,
    label = 'Add',
    account,
}: Props) {
    const [open, setOpen] = React.useState(false)
    const [state, formAction] = useActionState(createChartOfAccounts, {
        message: '',
    })
    const params = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const accountId = params.get('accountId')
        if (
            account &&
            accountId &&
            account?.id === Number(params.get('accountId'))
        ) {
            setOpen(true)
        }
    }, [account, params])

    useEffect(() => {
        if (state.message === '') return
        if (state.message === 'success') {
            toast.success('success')
            state.message = ''
        }
        if (state.message !== 'failed') {
            toast.error(state.message)
            state.message = ''
        }
    }, [state])

    if (!account) return <></>

    return (
        <Dialog
            open={open}
            onOpenChange={(bool) => {
                setOpen(bool)
                if (bool === false)
                    router.push(
                        `?${deleteKeyFromQueryString(params.toString(), 'accountId')}`
                    )
            }}
        >
            <DialogTrigger asChild>
                {/* <Button variant="outline" className={className}>
                    {label}
                </Button> */}
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <div className="p-1">
                    <form action={formAction}>
                        <DialogHeader>
                            <DialogTitle>Account Detail</DialogTitle>
                            <DialogDescription>{}</DialogDescription>
                        </DialogHeader>
                        <Label className="mb-3">Account Type</Label>
                        <Select
                            name="accountType"
                            defaultValue={account.type}
                            disabled
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Assets">Assets</SelectItem>
                                <SelectItem value="Liabilities">
                                    Liabilities
                                </SelectItem>
                                <SelectItem value="Equity">Equity</SelectItem>
                                <SelectItem value="Revenue">Revenue</SelectItem>
                                <SelectItem value="Expense">Expense</SelectItem>
                                <SelectItem value="OtherIncome">
                                    Other Income
                                </SelectItem>
                                <SelectItem value="OtherExpense">
                                    Other Expense
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Label className="mb-3">Account Number</Label>
                        <Input
                            name="accountNumber"
                            type="number"
                            defaultValue={account?.id}
                        />
                        <Label className="mb-3">Account Name</Label>
                        <Input
                            name="accountName"
                            defaultValue={account?.name}
                        />
                        <DialogFooter className="mt-4">
                            <Button
                                type="submit"
                                variant={'destructive'}
                                formAction={async () => {
                                    try {
                                        await deleteChartOfAccount(account.id)
                                        setOpen(false)
                                        router.push(
                                            `?${deleteKeyFromQueryString(params.toString(), 'accountId')}`
                                        )
                                        toast.success(
                                            `${account.id} - ${account.name} was deleted`
                                        )
                                    } catch (error) {
                                        toast.error('Error')
                                    }
                                }}
                            >
                                Delete
                            </Button>
                            <Button type="submit" variant={'outline'}>
                                Edit
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
