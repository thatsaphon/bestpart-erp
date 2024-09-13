import React from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
    DialogTitle,
    DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import toast from 'react-hot-toast'

type Props = {
    children?: React.ReactNode
    title: string
    description?: string
    confirmLabel?: string
    onConfirm?: () => Promise<void>
}

export default function ConfirmationDialog({
    children,
    title,
    description = 'ต้องการยืนยันหรือไม่',
    confirmLabel = 'ยืนยัน',
    onConfirm,
}: Props) {
    const [open, setOpen] = React.useState(false)

    const onClickConfirm = async () => {
        try {
            if (onConfirm) {
                await onConfirm()
            }
            setOpen(false)
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)
            return toast.error('Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={!!children}>{children}</DialogTrigger>
            <DialogContent className="md:w-[500px]">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>

                <DialogFooter>
                    <Button variant="destructive" onClick={onClickConfirm}>
                        {confirmLabel}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline">ยกเลิก</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
