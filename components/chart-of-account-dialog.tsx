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
import { createChartOfAccounts } from '@/app/actions/accounting'
import toast from 'react-hot-toast'

type Props = {
    className?: string
    label?: string
}

export default function ChartOfAccountDialog({
    className,
    label = 'Add',
}: Props) {
    const [open, setOpen] = React.useState(false)
    const [state, formAction] = useActionState(createChartOfAccounts, {
        message: '',
    })

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
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={className}>
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <form action={formAction}>
                    <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>สร้างบัญชีใหม่</DialogDescription>
                    </DialogHeader>
                    <Label className="mb-3">Account Type</Label>
                    <Select name="accountType" defaultValue="Assets">
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
                    <Input name="accountNumber" type="number" />
                    <Label className="mb-3">Account Name</Label>
                    <Input name="accountName" />
                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant={'secondary'}>
                                Close
                            </Button>
                        </DialogClose>
                        <Button type="submit" variant={'outline'}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
