'use client'

import { createQueryString } from '@/lib/searchParams'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Contact } from '@prisma/client'
import { CardStackIcon, TableIcon } from '@radix-ui/react-icons'
import { Table2Icon } from 'lucide-react'
import Link from 'next/link'

type Props = {
    contacts: Contact[]
}

export default function SearchInventory({ contacts }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const view = searchParams.get('view')
    return (
        <form
            action={async (formData) => {
                router.push(
                    `?${createQueryString(new URLSearchParams(searchParams), 'search', String(formData.get('search') || ''))}`
                )
            }}
        >
            <div className="flex w-full flex-wrap items-center gap-2">
                <Input
                    name="search"
                    type="search"
                    id="search"
                    placeholder="Search"
                    className="w-auto max-w-sm"
                />
                <Select>
                    <SelectTrigger className="w-[200px] max-w-xs">
                        <SelectValue placeholder="ผู้ขาย" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>ผู้ขาย</SelectLabel>
                            {contacts.map((item) => (
                                <SelectItem key={item.id} value={item.name}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button type="submit">Submit</Button>
                {view === 'table' ? (
                    <Link
                        href={`?${createQueryString(new URLSearchParams(searchParams), 'view', 'card')}`}
                    >
                        <CardStackIcon className="h-6 w-6" />
                    </Link>
                ) : (
                    <Link
                        href={`?${createQueryString(new URLSearchParams(searchParams), 'view', 'table')}`}
                    >
                        <Table2Icon className="h-6 w-6" />
                    </Link>
                )}
            </div>
        </form>
    )
}
