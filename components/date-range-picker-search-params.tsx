'use client'

import React from 'react'
import { DateRangePicker } from './ui/date-range-picker'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { getLastMonth } from '@/lib/get-last-month'

type Props = {}

export default function DateRangePickerSearchParams({}: Props) {
    const searchParams = useSearchParams()
    const router = useRouter()

    return (
        <DateRangePicker
            initialDateFrom={
                typeof searchParams.get('from') === 'string'
                    ? new Date(searchParams.get('from') as string)
                    : getLastMonth()
            }
            initialDateTo={
                typeof searchParams.get('to') === 'string'
                    ? new Date(searchParams.get('to') as string)
                    : (searchParams.get('to') ?? new Date())
            }
            showCompare={false}
            onUpdate={({ range, rangeCompare }) => {
                const newSearchParams = new URLSearchParams(searchParams)
                newSearchParams.set('from', format(range.from, 'yyyy-MM-dd'))
                newSearchParams.set(
                    'to',
                    format(range.to || range.from, 'yyyy-MM-dd')
                )
                router.push(`?${newSearchParams.toString()}`)
            }}
        />
    )
}
