'use client'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil1Icon } from '@radix-ui/react-icons'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { DialogHeader } from './ui/dialog'
import { getContactDetail } from '@/app/actions/contact/getContactDetail'
import { Button } from './ui/button'
import { updateContact } from '@/app/actions/contact/updateContact'
import toast from 'react-hot-toast'

type Contact = Awaited<ReturnType<typeof getContactDetail>>

type Props = {
    contact: Contact
}

export default function EditContactDialog({ contact }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    if (!contact) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Pencil1Icon className="h-4 w-4 text-primary/50 hover:cursor-pointer" />
            </DialogTrigger>
            <form
                action={async (formData) => {
                    try {
                        await updateContact(contact.id, formData)
                        toast.success('แก้ไขผู้ติดต่อสําเร็จ')
                        setIsOpen(false)
                    } catch (error) {
                        if (error instanceof Error)
                            return toast.error(error.message)

                        toast.error('Something went wrong')
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>แก้ไขผู้ติดต่อ</DialogHeader>
                    <Label>
                        <p className="mb-2">ชื่อผู้ติดต่อ: </p>
                        <Input defaultValue={contact.name} name="name" />
                    </Label>
                    <Label>
                        <p className="mb-2">เป็นลูกค้า: </p>
                        <Select
                            defaultValue={contact.isAr ? 'true' : 'false'}
                            name="isAr"
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'true'}>True</SelectItem>
                                <SelectItem value={'false'}>False</SelectItem>
                            </SelectContent>
                        </Select>
                    </Label>
                    <Label>
                        <p className="mb-2">เป็นคู่ค้า: </p>
                        <Select
                            defaultValue={contact.isAp ? 'true' : 'false'}
                            name="isAp"
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'true'}>True</SelectItem>
                                <SelectItem value={'false'}>False</SelectItem>
                            </SelectContent>
                        </Select>
                    </Label>
                    <Label>
                        <p className="mb-2">สามารถขายเงินเชื่อ: </p>
                        <Select
                            defaultValue={contact.credit ? 'true' : 'false'}
                            name="credit"
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'true'}>True</SelectItem>
                                <SelectItem value={'false'}>False</SelectItem>
                            </SelectContent>
                        </Select>
                    </Label>
                    <Label>
                        <p className="mb-2">คำค้นหา: </p>
                        <Input
                            defaultValue={contact.searchKeyword || undefined}
                            name="searchKeyword"
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
                </DialogContent>
            </form>
        </Dialog>
    )
}
