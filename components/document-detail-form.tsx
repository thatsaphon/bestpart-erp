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
import { Label } from './ui/label'
import { Input } from './ui/input'
import { DocumentDetail } from '@/types/document-detail'
import SelectSearchContact from './select-search-contact'
import SelectSearchContactSearchParams from './select-search-contact-search-params'

type Props = {
    disabled?: boolean
    name?: string
    documentDetail: DocumentDetail
    setDocumentDetail: React.Dispatch<React.SetStateAction<DocumentDetail>>
    label?: string
    placeholder?: string
    useSearchParams?: boolean
}

export function DocumentDetailForm({
    disabled,
    name = 'date',
    documentDetail,
    setDocumentDetail,
    label = 'ผู้ติดต่อ',
    placeholder,
    useSearchParams = false,
}: Props) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-3">
                <Label className="flex items-center gap-2">
                    <p className="">วันที่</p>

                    <Popover>
                        <PopoverTrigger asChild disabled={disabled}>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-[240px] justify-start text-left font-normal',
                                    !documentDetail?.date &&
                                        'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <input
                                    name={name}
                                    type="hidden"
                                    onChange={(e) => {
                                        setDocumentDetail((prev) => ({
                                            ...prev,
                                            date: new Date(e.target.value),
                                        }))
                                    }}
                                    value={documentDetail?.date.toLocaleString()}
                                />
                                {documentDetail?.date ? (
                                    format(documentDetail.date, 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="flex w-auto flex-col space-y-2 p-2"
                            onInteractOutside={(e) => e.preventDefault()}
                        >
                            <Select
                                onValueChange={(value) => {
                                    setDocumentDetail((prev) => ({
                                        ...prev,
                                        date: addDays(
                                            new Date(),
                                            parseInt(value)
                                        ),
                                    }))
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="-1">
                                        Yesterday
                                    </SelectItem>
                                    <SelectItem value="0">Today</SelectItem>
                                    <SelectItem value="1">Tomorrow</SelectItem>
                                    <SelectItem value="3">In 3 days</SelectItem>
                                    <SelectItem value="7">In a week</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="rounded-md border">
                                <Calendar
                                    mode="single"
                                    selected={documentDetail.date}
                                    onSelect={(value) => {
                                        console.log(value)
                                        !!value &&
                                            setDocumentDetail((prev) => ({
                                                ...prev,
                                                date: value,
                                            }))
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </Label>
                <Label className="flex items-center gap-2">
                    <p className="">No. </p>
                    <Input
                        className="w-auto"
                        name="documentNo"
                        placeholder="Optional"
                        value={documentDetail?.documentNo}
                        onChange={(e) => {
                            setDocumentDetail((prev) => ({
                                ...prev,
                                documentNo: e.target.value,
                            }))
                        }}
                    />
                    <span>Ref. </span>
                    <Input
                        className="w-auto"
                        name="referenceNo"
                        placeholder="Optional"
                        value={documentDetail?.referenceNo || ''}
                        onChange={(e) => {
                            setDocumentDetail((prev) => ({
                                ...prev,
                                referenceNo: e.target.value,
                            }))
                        }}
                    />
                </Label>
            </div>

            {useSearchParams ? (
                <SelectSearchContactSearchParams
                    label={label}
                    hasTextArea={true}
                    placeholder={placeholder}
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                />
            ) : (
                <SelectSearchContact
                    label={label}
                    hasTextArea={true}
                    placeholder={placeholder}
                    documentDetail={documentDetail}
                    setDocumentDetail={setDocumentDetail}
                />
            )}
        </div>
    )
}
