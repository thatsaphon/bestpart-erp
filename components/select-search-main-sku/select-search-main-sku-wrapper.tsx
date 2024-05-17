'use client'

import { useState, useEffect } from 'react'
import SelectSearchMainSku from './select-search-main-sku'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'

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
    document?: Awaited<ReturnType<typeof getSalesInvoiceDetail>>
}

export default function SelectSearchMainSkuWrapper({
    totalRows,
    setTotalRows,
    setItems,
    type = 'sales',
    document: doc,
}: Props) {
    useEffect(() => {
        if (!doc && totalRows.length === 0)
            setTotalRows([window.crypto.randomUUID()])
        async function fetchBarcode() {
            if (doc && totalRows.length === 0) {
                setTotalRows(doc.SkuOut.map((item) => item.barcode))
            }
        }
        fetchBarcode()
    }, [doc, setItems, setTotalRows, totalRows.length])

    const onInsertRow = () => {
        const newRowId = window.crypto.randomUUID()
        setTotalRows([...totalRows, newRowId])
        setTimeout(() => {
            document.getElementById(`input-${newRowId}`)?.focus()
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
                    defaultBarcode={
                        doc?.SkuOut.find((item) => item.barcode === rowId)
                            ?.barcode
                    }
                />
            ))}
        </>
    )
}
