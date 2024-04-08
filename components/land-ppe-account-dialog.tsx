'use client'

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
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './ui/card'
import { DashIcon, Cross2Icon } from '@radix-ui/react-icons'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { z } from 'zod'
import { AuthPayloadSchema } from '@/app/schema/authPayloadSchema'
import { Badge } from './ui/badge'
import { XIcon } from 'lucide-react'
import { useFormState } from 'react-dom'
import toast from 'react-hot-toast'
import { createChartOfAccounts } from '@/app/actions/accounting'

type Props = {
    className?: string
    label?: string
    type: 'Petty Cash' | 'Bank Account' | 'Cashier'
    users: z.infer<typeof AuthPayloadSchema>[]
}

const typePrefix = {
    'Petty Cash': '111',
    'Bank Account': '112',
    Cashier: '113',
}

export default function LandAndPPEAccountDialog({
    className,
    label = 'New Cash',
    type,
    users,
}: Props) {
    const [open, setOpen] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [state, formAction] = useFormState(createChartOfAccounts, {
        message: '',
    })
    const [accountNumber, setAccountNumber] = useState<string>('')

    useEffect(() => {
        if (state.message === '') return
        if (state.message === 'success') {
            toast.success('success')
            state.message = ''
            setOpen(false)
        }
        if (state.message === 'failed') {
            toast.error(state.message)
            state.message = ''
        }
    }, [state])
    function addSelectedUser(username: string) {
        setSelectedUsers([...selectedUsers, username])
    }
    function removeOwner(username: string) {
        const newSelectedUser = selectedUsers.filter(
            (user) => user !== username
        )
        setSelectedUsers(newSelectedUser)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={cn(className)}>
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <form action={formAction}>
                    <DialogHeader>
                        <DialogTitle>Add New {type}</DialogTitle>
                        <DialogDescription>สร้างบัญชีใหม่</DialogDescription>
                    </DialogHeader>

                    <Label className="mb-3">Account Number</Label>
                    <div className="flex items-center gap-3">
                        <Card className="flex justify-center bg-muted py-2 pl-5 pr-6 tracking-[0.4em]">
                            <span>{typePrefix[type]}</span>
                        </Card>
                        <DashIcon />
                        <Input
                            // name="accountNumber"
                            type="text"
                            maxLength={2}
                            className="tracking-[0.4em]"
                            placeholder="00"
                            onChange={(e) => setAccountNumber(e.target.value)}
                            value={accountNumber}
                        />
                        <Input
                            name="accountNumber"
                            type="text"
                            className="hidden"
                            value={typePrefix[type] + accountNumber}
                        />
                    </div>
                    <Label className="mb-3">Account Name</Label>
                    <Input name="accountName" />
                    <Input
                        name="accountType"
                        value={'Assets'}
                        className="hidden"
                    />
                    <Label className="mb-3">Select Owner</Label>
                    <Select
                        name="user"
                        onValueChange={addSelectedUser}
                        value=""
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {users
                                .filter(
                                    (user) =>
                                        !selectedUsers.includes(user.username)
                                )
                                .map((user) => (
                                    <SelectItem
                                        key={user.username}
                                        value={user.username}
                                    >
                                        {user.username} - {user.role}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <div className="mt-2">
                        {selectedUsers.map((user) => (
                            <Badge
                                key={user}
                                className="m-1"
                                variant="secondary"
                            >
                                {user}
                                <Cross2Icon
                                    className="ml-1 w-3 hover:cursor-pointer"
                                    onClick={() => removeOwner(user)}
                                ></Cross2Icon>
                            </Badge>
                        ))}
                        {selectedUsers.map((user) => (
                            <input
                                key={user}
                                className="hidden"
                                value={user}
                                name="accountOwners"
                            />
                        ))}
                    </div>
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
