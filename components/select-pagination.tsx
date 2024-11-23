'use client'

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { createQueryString } from '@/lib/searchParams'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
    count: number
}

export default function SelectPagination({ count }: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()
    return (
        <Select
            value={searchParams.get('page') || '1'}
            onValueChange={(value) => {
                router.push(
                    `?${createQueryString(searchParams, 'page', value)}`
                )
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: Math.ceil(count / 50) }).map(
                    (_, index) => (
                        <SelectItem
                            key={index + 1}
                            value={(index + 1).toString()}
                        >
                            {(index + 1).toString()}
                        </SelectItem>
                    )
                )}
            </SelectContent>
        </Select>
    )
}
