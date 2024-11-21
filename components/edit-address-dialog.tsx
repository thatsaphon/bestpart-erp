'use client'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Cross1Icon,
    Cross2Icon,
    CrossCircledIcon,
    Pencil1Icon,
} from '@radix-ui/react-icons'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useRef, useState } from 'react'
import { DialogHeader } from './ui/dialog'
import { getContactDetail } from '@/app/actions/contact/getContactDetail'
import { Button } from './ui/button'
import { updateContact } from '@/app/actions/contact/updateContact'
import toast from 'react-hot-toast'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import updateAddress from '@/app/actions/contact/updateAddress'

type Contact = Awaited<ReturnType<typeof getContactDetail>>

type Props = {
    contact: Contact
}

export default function EditAddressDialog({ contact }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const dialog = useRef(null)

    if (!contact) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Pencil1Icon className="h-4 w-4 text-primary/50 hover:cursor-pointer" />
            </DialogTrigger>
            <DialogContent ref={dialog}>
                <form
                    className="flex flex-col gap-4"
                    action={async (formData) => {
                        try {
                            await updateAddress(contact.id, formData)
                            toast.success('แก้ไขผู้ติดต่อสําเร็จ')
                            setIsOpen(false)
                        } catch (error) {
                            if (error instanceof Error)
                                return toast.error(error.message)

                            toast.error('Something went wrong')
                        }
                    }}
                >
                    <DialogHeader>แก้ไขผู้ติดต่อ</DialogHeader>
                    <Label>
                        <p className="mb-2">ชื่อผู้ติดต่อ: </p>
                        <Input defaultValue={contact.name} name="name" />
                    </Label>
                    <Label>
                        <p className="mb-2">ที่อยู่: </p>
                        <Textarea
                            defaultValue={contact.address}
                            name="address"
                            rows={3}
                        />
                    </Label>
                    <Label>
                        <p className="mb-2">โทร: </p>
                        <Input defaultValue={contact.phone} name="phone" />
                    </Label>
                    <Label>
                        <p className="mb-2">เลขประจำตัวผู้เสียภาษี: </p>
                        <Input
                            defaultValue={contact.taxId || ''}
                            name="taxId"
                        />
                    </Label>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant={'outline'} type="button">
                                Close
                            </Button>
                        </DialogClose>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
