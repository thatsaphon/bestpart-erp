'use client'

import React, { Fragment } from 'react'
import {
    defaultDocumentRemark,
    GetDocumentRemark,
} from '@/types/remark/document-remark'
import { inputNumberPreventDefault } from '@/lib/input-number-prevent-default'
import { Cross1Icon } from '@radix-ui/react-icons'
import {
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
} from '@/components/ui/select'
import { Select } from '@/components/ui/select'
import { Input } from './ui/input'
import { PlusCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    existingDocumentRemark: GetDocumentRemark[]
    documentRemarks: GetDocumentRemark[]
    setDocumentRemarks: React.Dispatch<GetDocumentRemark[]>
}

export default function CreateDocumentRemark({
    existingDocumentRemark,
    documentRemarks,
    setDocumentRemarks,
}: Props) {
    const addDefaultDocumentRemark = () => {
        setDocumentRemarks([...documentRemarks, defaultDocumentRemark()])
    }

    return (
        <div className="grid w-full grid-cols-[1fr_300px_1fr] items-center gap-x-5 p-3">
            <div className="justify-self-end">หมายเหตุ</div>
            {documentRemarks.map((remark, index) => (
                <Fragment key={index}>
                    <div className="col-span-2 col-start-2 flex items-baseline gap-2">
                        <Input
                            type="text"
                            className={cn(
                                'justify-self-start',
                                remark.isDeleted && 'line-through'
                            )}
                            disabled={remark.isDeleted}
                            value={remark.remark}
                            onKeyDown={inputNumberPreventDefault}
                            onChange={(e) =>
                                setDocumentRemarks([
                                    ...documentRemarks.map((p, i) =>
                                        i === index
                                            ? {
                                                  ...p,
                                                  remark: e.target.value,
                                              }
                                            : p
                                    ),
                                ])
                            }
                        />
                        <Cross1Icon
                            className="text-destructive hover:cursor-pointer"
                            onClick={() =>
                                existingDocumentRemark.find(
                                    ({ id }) => remark.id === id
                                )
                                    ? setDocumentRemarks(
                                          documentRemarks.map((p, i) =>
                                              i === index
                                                  ? {
                                                        ...p,
                                                        isDeleted: !p.isDeleted,
                                                    }
                                                  : { ...p }
                                          )
                                      )
                                    : setDocumentRemarks([
                                          ...documentRemarks.filter(
                                              (p, i) => i !== index
                                          ),
                                      ])
                            }
                        />
                    </div>
                </Fragment>
            ))}
            <PlusCircleIcon
                className={cn(
                    'col-span-2 col-start-2 mt-1 justify-self-center text-primary/50 hover:cursor-pointer hover:text-primary'
                )}
                onClick={addDefaultDocumentRemark}
            />
        </div>
    )
}
