'use client'

import React, { Fragment } from 'react'
import { GetDocumentRemark } from '@/types/remark/document-remark'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { Cross1Icon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { addDocumentRemark } from '@/actions/add-document-remark'
import toast from 'react-hot-toast'
import ConfirmationDialog from './confirmation-dialog'
import { shortDateFormat } from '@/lib/date-format'
import { deleteDocumentRemark } from '@/actions/delete-document-remark'

type Props = {
    existingDocumentRemark: GetDocumentRemark[]
    documentId: number
}

export default function UpdateDocumentRemark({
    existingDocumentRemark,
    documentId,
}: Props) {
    const [remark, setRemark] = React.useState<string>('')

    return (
        <div>
            <div className="flex items-baseline justify-center gap-x-1">
                <p className="text-right text-primary/60">หมายเหตุ: </p>
                <div className="max-w-[1000px] text-left">
                    {existingDocumentRemark
                        .sort((a, b) => a.id - b.id)
                        .map((remark, index) => (
                            <Fragment key={index}>
                                <p
                                    className={cn(
                                        'col-start-2 overflow-auto',
                                        remark.isDeleted && 'line-through'
                                    )}
                                >
                                    {remark.remark}
                                    <span className="text-primary/50">{` - ${remark.User?.first_name} ${remark.User?.last_name} - ${shortDateFormat(remark.createdAt)}`}</span>
                                    {!remark.isDeleted && (
                                        <ConfirmationDialog
                                            title="ลบหมายเหตุ"
                                            onConfirm={async () => {
                                                try {
                                                    await deleteDocumentRemark(
                                                        remark.id
                                                    )
                                                    toast.success(
                                                        'ลบหมายเหตุสําเร็จ'
                                                    )
                                                } catch (err) {}
                                            }}
                                        >
                                            <Cross1Icon className="ml-1 inline text-destructive hover:cursor-pointer" />
                                        </ConfirmationDialog>
                                    )}
                                </p>
                            </Fragment>
                        ))}
                </div>
            </div>
            <div className="mx-auto mt-1 flex w-[700px] items-center justify-center gap-1">
                <Input
                    type="text"
                    className="text-sm"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />
                <ConfirmationDialog
                    title="เพิ่มหมายเหตุ"
                    onConfirm={async () => {
                        try {
                            await addDocumentRemark(documentId, remark)
                            toast.success('เพิ่มหมายเหตุสําเร็จ')
                        } catch (err) {
                            if (err instanceof Error) {
                                if (err.message === 'NEXT_REDIRECT') {
                                    toast.success('บันทึกสําเร็จ')
                                    return
                                }
                                toast.error(err.message)
                                return
                            }
                            toast.error('เกิดข้อผิดพลาด')
                        }
                    }}
                >
                    <Button size="sm" disabled={!remark}>
                        เพิ่มหมายเหตุ
                    </Button>
                </ConfirmationDialog>
            </div>
        </div>
    )
}
