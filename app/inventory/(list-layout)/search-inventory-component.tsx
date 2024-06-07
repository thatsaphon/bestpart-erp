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

type Props = {
    contacts: Contact[]
}

export default function SearchInventory({ contacts }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    return (
        <form
            action={async (formData) => {
                router.push(
                    `?${createQueryString(new URLSearchParams(searchParams), 'search', String(formData.get('search') || ''))}`
                )
            }}
        >
            <div className="flex w-full flex-wrap gap-2 ">
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
            </div>
        </form>
    )
}
