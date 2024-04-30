'use client'

import { useState, useEffect } from 'react'
import SelectSearchMainSku from './select-search-main-sku'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'

type Props = {
    totalRows: string[]
    setTotalRows: (totalRows: string[]) => void
    setItems: React.Dispatch<
        React.SetStateAction<
            (Awaited<ReturnType<typeof findGoodsMasterByBarcode>> & {
                quantity: number
                rowId: string
            })[]
        >
    >
    type?: 'sales' | 'purchase'
}

export default function SelectSearchMainSkuWrapper({
    totalRows,
    setTotalRows,
    setItems,
    type = 'sales',
}: Props) {
    useEffect(() => {
        if (totalRows.length === 0) setTotalRows([window.crypto.randomUUID()])
    }, [setTotalRows, totalRows.length])

    const onInsertRow = () => {
        const newRowId = window.crypto.randomUUID()
        setTotalRows([...totalRows, newRowId])
        setTimeout(() => {
            document.getElementById(newRowId)?.focus()
        }, 200)
    }
    return (
        <>
            {totalRows.map((rowId, index) => (
                <SelectSearchMainSku
                    key={rowId}
                    rowId={rowId}
                    totalRows={totalRows}
                    setTotalRows={setTotalRows}
                    onInsertRow={onInsertRow}
                    setItems={setItems}
                    type={type}
                />
            ))}
        </>
    )
}
