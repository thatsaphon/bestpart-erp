'use client'

import * as React from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type Props = {
    disabled?: boolean
    defaultDate?: Date
    name?: string
}

export function DatePickerWithPresets({
    disabled,
    defaultDate,
    name = 'date',
}: Props) {
    const [date, setDate] = React.useState<Date>(defaultDate || new Date())

    return (
        <Popover>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <input
                        name={name}
                        type="hidden"
                        onChange={(e) => {
                            setDate(new Date(e.target.value))
                        }}
                        value={date.toISOString().substring(0, 10)}
                    />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="flex w-auto flex-col space-y-2 p-2"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <Select
                    onValueChange={(value) =>
                        setDate(addDays(new Date(), parseInt(value)))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="-1">Yesterday</SelectItem>
                        <SelectItem value="0">Today</SelectItem>
                        <SelectItem value="1">Tomorrow</SelectItem>
                        <SelectItem value="3">In 3 days</SelectItem>
                        <SelectItem value="7">In a week</SelectItem>
                    </SelectContent>
                </Select>
                <div className="rounded-md border">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(value) => !!value && setDate(value)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
