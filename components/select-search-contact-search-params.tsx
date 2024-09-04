'use client'

import SelectSearchContact from '@/components/select-search-contact'
import { createQueryString, deleteKeyFromQueryString } from '@/lib/searchParams'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {
    label?: string
    name?: string
    hasTextArea?: boolean
    placeholder?: string
    disabled?: boolean
    documentDetail: DocumentDetail
    setDocumentDetail: React.Dispatch<React.SetStateAction<DocumentDetail>>
}

export default function SelectSearchContactSearchParams({
    label = 'ผู้ติดต่อ',
    name = 'customerId',
    hasTextArea,
    placeholder,
    disabled,
    documentDetail,
    setDocumentDetail,
}: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!documentDetail.contactId) {
            router.push(
                '?' +
                    deleteKeyFromQueryString(
                        new URLSearchParams(searchParams),
                        'contactId'
                    )
            )
            return
        }
        router.push(
            '?' +
                createQueryString(
                    new URLSearchParams(searchParams),
                    'contactId',
                    String(documentDetail.contactId)
                )
        )
    }, [documentDetail.contactId, router, searchParams])
    const onSetDocumentDetail = (documentDetail: DocumentDetail) => {
        router.push(
            '?' +
                createQueryString(
                    new URLSearchParams(searchParams),
                    'contactId',
                    String(documentDetail.contactId)
                )
        )
        return setDocumentDetail(documentDetail)
    }

    return (
        <SelectSearchContact
            documentDetail={documentDetail}
            setDocumentDetail={setDocumentDetail}
            label={label}
            name={name}
            hasTextArea={hasTextArea}
            placeholder={placeholder}
            disabled={disabled}
        />
    )
}
