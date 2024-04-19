import { searchAccountReceivable } from '@/app/actions/contact/searchAccountReceivable'
import searchAccountReceivableById from '@/app/actions/contact/searchAccountReceivableById'
import prisma from '@/app/db/db'
import { DatePickerWithPresets } from '@/components/date-picker-preset'
import SelectSearch from '@/components/select-search'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

type Props = {
    searchParams: {
        page?: string
        limit?: string
        search?: string
    }
}

export default function NewSales({}: Props) {
    return (
        <div className="mb-2 p-3">
            <form action="">
                <div className="flex gap-3">
                    <div className="space-x-2">
                        <Label>วันที่</Label>
                        <DatePickerWithPresets />
                    </div>
                    <div className="space-x-2">
                        <Label>No.</Label>
                        <Input className="w-auto" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-baseline space-x-2">
                        <Label>ลูกหนี้</Label>
                        <SelectSearch
                            searchFunction={searchAccountReceivable}
                            searchByIdFunction={searchAccountReceivableById}
                            keys={['id', 'name']}
                            keysMap={{ id: 'Id', name: 'ชื่อลูกค้า' }}
                            name="ar"
                            hasTextArea={true}
                            textAreaKeys={['name']}
                        />
                    </div>
                    <div className="space-x-2">
                        <Label>ที่อยู่</Label>
                        <Input className="w-auto" />
                    </div>
                </div>
            </form>
        </div>
    )
}
