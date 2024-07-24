'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import React from 'react'
import deleteOtherInvoice from './delete-other-invoice'
import toast from 'react-hot-toast'

type Props = {
    documentNo: string
}

export default function DeleteOtherInvoiceButton({ documentNo }: Props) {
    const [isOpen, setOpen] = React.useState(false)

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setOpen(true)}>
                        ลบ
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ลบใบแจ้งหนี้</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจที่จะลบใบแจ้งหนี้นี้หรือไม่
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="default"
                            onClick={async () => {
                                try {
                                    await deleteOtherInvoice(documentNo)
                                    toast.success('ลบใบแจ้งหนี้สําเร็จ')
                                } catch (err) {
                                    if (err instanceof Error)
                                        return toast.error(err.message)
                                    toast.error('Something went wrong')
                                }
                            }}
                        >
                            ลบ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
