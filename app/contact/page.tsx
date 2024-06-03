import { Input } from '@/components/ui/input'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import prisma from '@/app/db/db'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { createQueryString, deleteKeyFromQueryString } from '@/lib/searchParams'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pencil1Icon } from '@radix-ui/react-icons'

type Props = {
    searchParams: {
        type?: string
    }
}

export default async function ContactPage({
    searchParams,
    searchParams: { type = 'all' },
}: Props) {
    const contacts = await prisma.contact.findMany({
        where: {
            isAr: type === 'ar' ? true : undefined,
            isAp: type === 'ap' ? true : undefined,
        },
        include: {
            Address: true,
            ArSubledger: {
                include: {
                    Document: {
                        include: {
                            GeneralLedger: {
                                where: { chartOfAccountId: 12000 },
                            },
                        },
                    },
                },
            },
            ApSubledger: {
                include: {
                    Document: {
                        include: {
                            GeneralLedger: {
                                where: { chartOfAccountId: 21000 },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [{ name: 'asc' }],
    })
    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>ชื่อผู้ติดต่อ</span>

                {/* <CreateMainSkuDialog /> */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'outline'}>สร้างผู้ติดต่อ</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>สร้างผู้ติดต่อ</DialogTitle>
                        </DialogHeader>
                        <Label>
                            ชื่อผู้ติดต่อ{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="กรอกชื่อผู้ติดต่อ"
                            required
                            name="name"
                        />
                        {/* <Label className="mt-2">Part-Number</Label>
                        <Input placeholder="Optional" name="partNumber" /> */}
                        <DialogFooter className="mt-4">
                            <Button type="submit" variant={'default'}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </h1>
            <div className="mt-2 grid w-full max-w-sm grid-cols-2 items-center gap-1.5">
                <Input type="search" id="search" placeholder="Search" />
            </div>
            <div>
                <ToggleGroup type="single" value={type}>
                    <Link
                        href={`?${deleteKeyFromQueryString(new URLSearchParams(searchParams), 'type')}`}
                    >
                        <ToggleGroupItem value={'all'}>ทั้งหมด</ToggleGroupItem>
                    </Link>
                    <Link
                        href={`?${createQueryString(new URLSearchParams(searchParams), 'type', String('ar'))}`}
                    >
                        <ToggleGroupItem value={'ar'}>ลูกค้า</ToggleGroupItem>
                    </Link>
                    <Link
                        href={`?${createQueryString(new URLSearchParams(searchParams), 'type', String('ap'))}`}
                    >
                        <ToggleGroupItem value={'ap'}>คู่ค้า</ToggleGroupItem>
                    </Link>
                </ToggleGroup>
            </div>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Id</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>ยอดค้างรับ</TableHead>
                            <TableHead>ยอดค้างจ่าย</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>{contact.id}</TableCell>
                                <TableCell>
                                    {contact.name}
                                    {contact.isAr ? (
                                        <Badge
                                            variant={'outline'}
                                            className="ml-2 font-normal"
                                        >
                                            ลูกค้า
                                        </Badge>
                                    ) : (
                                        ''
                                    )}
                                    {contact.isAp ? (
                                        <Badge
                                            variant={'outline'}
                                            className="ml-2 font-normal"
                                        >
                                            คู่ค้า
                                        </Badge>
                                    ) : (
                                        ''
                                    )}
                                </TableCell>
                                <TableCell>
                                    {
                                        contact.Address.find(
                                            ({ isMain }) => isMain
                                        )?.phone
                                    }
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={`/contact/${contact.id}/receivable`}
                                    >
                                        {contact.ArSubledger.filter(
                                            ({ paymentStatus }) =>
                                                paymentStatus === 'NotPaid'
                                        ).reduce(
                                            (acc, curr) =>
                                                acc +
                                                curr.Document.GeneralLedger.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.amount,
                                                    0
                                                ),
                                            0
                                        )}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {
                                        -contact.ApSubledger.reduce(
                                            (acc, curr) =>
                                                acc +
                                                curr.Document.GeneralLedger.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.amount,
                                                    0
                                                ),
                                            0
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    <Link href={`/contact/${contact.id}`}>
                                        <Pencil1Icon className="h-4 w-4 text-primary/50 hover:cursor-pointer hover:text-primary" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
