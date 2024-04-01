'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'

type Props = {
    resetChartOfAccount: () => void
}

export default function ResetChartOfAccountDialog({
    resetChartOfAccount,
}: Props) {
    const [open, setOpen] = useState(false)

    const onClickReset = async () => {
        // const result = await fetch('/master-data/chart-of-account.csv')
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'destructive'}>Reset</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset to default</DialogTitle>
                </DialogHeader>
                <span>Are you sure to reset chart of account to default?</span>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant={'secondary'}>
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={async () => {
                            await resetChartOfAccount()
                            setOpen(false)
                        }}
                    >
                        Reset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
