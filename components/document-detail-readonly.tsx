'use client'

import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { DocumentDetail } from '@/types/document-detail'
import { Textarea } from './ui/textarea'

type Props = {
    name?: string
    documentDetail: DocumentDetail
    label?: string
    placeholder?: string
}

export function DocumentDetailReadonly({
    name = 'date',
    documentDetail,
    label = 'ผู้ติดต่อ',
    placeholder,
}: Props) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-3">
                <Label className="flex items-center gap-2">
                    <p className="">วันที่</p>

                    <Button
                        variant={'outline'}
                        className={cn(
                            'w-[240px] justify-start text-left font-normal',
                            !documentDetail?.date && 'text-muted-foreground'
                        )}
                        disabled
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <input
                            name={name}
                            type="hidden"
                            disabled
                            value={documentDetail?.date.toLocaleString()}
                        />
                        {documentDetail?.date ? (
                            format(documentDetail.date, 'PPP')
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </Label>
                <Label className="flex items-center gap-2">
                    <p className="">No. </p>
                    <Input
                        className="w-auto"
                        name="documentNo"
                        disabled
                        placeholder="Optional"
                        value={documentDetail?.documentNo}
                        onChange={(e) => {}}
                    />
                    <span>Ref. </span>
                    <Input
                        className="w-auto"
                        name="referenceNo"
                        disabled
                        placeholder="Optional"
                        value={documentDetail?.referenceNo || ''}
                        onChange={(e) => {}}
                    />
                </Label>
            </div>

            <div className="my-1 flex items-baseline space-x-2">
                <Label>{label}</Label>
                <span className="grid w-[500px] grid-cols-2 gap-1">
                    <span className="relative">
                        <Input
                            name={name}
                            value={documentDetail.contactId || ''}
                            className={cn(
                                'w-[240px] justify-start text-left font-normal'
                            )}
                            placeholder={placeholder}
                            disabled
                        />
                    </span>

                    <div className="col-start-1">
                        <Input
                            name="contactName"
                            placeholder="ชื่อ"
                            value={documentDetail.contactName}
                            disabled
                        />
                        <Textarea
                            value={documentDetail.address}
                            name="address"
                            placeholder="ที่อยู่"
                            className="col-start-1 row-span-2"
                            disabled
                        />
                    </div>
                    <div>
                        <Input
                            name="phone"
                            placeholder="เบอร์โทร"
                            value={documentDetail.phone}
                            disabled
                        />
                        <Input
                            name="taxId"
                            placeholder="taxId"
                            value={documentDetail.taxId}
                            disabled
                        />
                    </div>
                </span>
            </div>
        </div>
    )
}
