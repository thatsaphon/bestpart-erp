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
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './ui/card'
import { DashIcon } from '@radix-ui/react-icons'
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

export default function CashAccountDialog({
    className,
    label = 'New Cash',
    type,
    users,
}: Props) {
    const [open, setOpen] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    function addSelectedUser(username: string) {
        setSelectedUsers([...selectedUsers, username])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={cn(className)}>
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col">
                <form>
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
                            name="accountNumber"
                            type="text"
                            maxLength={2}
                            className="tracking-[0.4em]"
                            placeholder="00"
                        />
                    </div>
                    <Label className="mb-3">Account Name</Label>
                    <Input name="accountName" />
                    <Label className="mb-3">Select Owner</Label>
                    <Select name="user" onValueChange={addSelectedUser}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
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
                            </Badge>
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
