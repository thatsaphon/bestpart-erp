'use client'

import { useState, useEffect } from 'react'
import SelectSearchMainSku from './select-search-main-sku'

type Props = {}

export default function SelectSearchMainSkuWrapper({}: Props) {
    const [totalRows, setTotalRows] = useState<string[]>([])

    useEffect(() => {
        if (totalRows.length === 0) setTotalRows([window.crypto.randomUUID()])
    }, [totalRows.length])

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
                    onInsertRow={onInsertRow}
                />
            ))}
        </>
    )
}
