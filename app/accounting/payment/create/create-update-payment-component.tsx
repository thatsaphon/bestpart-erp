'use client'

import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearchVendor from '@/components/select-search-vendor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

type Props = {}

export default function CreateUpdatePaymentComponent({}: Props) {
    return (
        <div className="p-3">
            <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                    <Label className="flex items-center gap-2">
                        <p className="">วันที่</p>
                        <DatePickerWithPresets
                        // defaultDate={defaultDocumentDetails?.date}
                        />
                    </Label>
                    <Label className="flex items-center gap-2">
                        <p className="">No. </p>
                        <Input
                            className="w-auto"
                            name="documentId"
                            placeholder="Optional"
                            // defaultValue={
                            //     defaultDocumentDetails?.documentId
                            // }
                        />
                    </Label>
                </div>
                <div className="my-1 flex items-baseline space-x-2">
                    <Label>เจ้าหนี้</Label>
                    <SelectSearchVendor
                        name="customerId"
                        hasTextArea={true}
                        placeholder="รหัสเจ้าหนี้"
                        // defaultValue={String(
                        //     defaultDocumentDetails?.contactId || ''
                        // )}
                        // defaultAddress={{
                        //     name: defaultDocumentDetails?.contactName || '',
                        //     address: defaultDocumentDetails?.address || '',
                        //     phone: defaultDocumentDetails?.phone || '',
                        //     taxId: defaultDocumentDetails?.taxId || '',
                        // }}
                    />
                </div>
            </div>
        </div>
    )
}
