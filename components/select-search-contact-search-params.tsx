'use client'

import { searchAccountReceivableById } from '@/app/actions/contact/searchAccountReceivableById'
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
        if (!searchParams.get('contactId')) {
            setDocumentDetail(getDefaultDocumentDetail())
        }
        if (searchParams.get('contactId')) {
            searchAccountReceivableById(
                Number(searchParams.get('contactId'))
            ).then((result) => {
                setDocumentDetail({
                    id: 0,
                    documentNo: '',
                    date: new Date(),
                    contactId: result.id,
                    contactName: result.name,
                    address: result.address,
                    phone: result.phone,
                    taxId: result.taxId || '',
                })
            })
        }
    }, [searchParams, setDocumentDetail])
    const onSetDocumentDetail = (documentDetail: DocumentDetail) => {
        if (!documentDetail.contactId) {
            router.push(
                '?' +
                    deleteKeyFromQueryString(
                        new URLSearchParams(searchParams),
                        'contactId'
                    )
            )
        } else {
            router.push(
                '?' +
                    createQueryString(
                        new URLSearchParams(searchParams),
                        'contactId',
                        String(documentDetail.contactId)
                    )
            )
        }
    }

    return (
        <SelectSearchContact
            key={documentDetail.contactId}
            documentDetail={documentDetail}
            setDocumentDetail={onSetDocumentDetail}
            label={label}
            name={name}
            hasTextArea={hasTextArea}
            placeholder={placeholder}
            disabled={disabled}
        />
    )
}
