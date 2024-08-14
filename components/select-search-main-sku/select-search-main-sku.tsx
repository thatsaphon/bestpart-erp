'use client'

import React, { Fragment, ReactNode, useEffect, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon, Cross1Icon } from '@radix-ui/react-icons'
import { Input } from '../ui/input'
import { SearchIcon } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Textarea } from '../ui/textarea'
import toast from 'react-hot-toast'
import searchGoodsMasters from '@/app/actions/inventory/goodsMaster/searchGoodsMasters'
import { findGoodsMasterByBarcode } from '@/app/actions/inventory/goodsMaster/findGoodsMasterByBarcode'
import Image from 'next/image'
import { indexIJK, lengthOfArray4D } from '@/lib/index-i-j-k'
import PaginationClientComponent from '../pagination-client-component'

type Props = {
    caption?: string
    onInsertRow?: () => void
    rowId: string
    totalRows: string[]
    setTotalRows: (totalRows: string[]) => void
    setItems: React.Dispatch<
        React.SetStateAction<
            (ReturnSearchType & {
                quantity: number
                rowId: string
                price?: number
            })[]
        >
    >
    type?: 'sales' | 'purchase'
    defaultBarcode?: string
    defaultQuantity?: number
}

type ReturnSearchType = Awaited<ReturnType<typeof findGoodsMasterByBarcode>>

export default function SelectSearchMainSku({
    caption,
    onInsertRow,
    rowId,
    totalRows,
    setTotalRows,
    setItems,
    type = 'sales',
    defaultBarcode,
    defaultQuantity,
}: Props) {
    const [page, setPage] = useState(1)
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<ReturnSearchType[]>([])
    const [selectedId, setSelectedId] = useState<string>(defaultBarcode || '')
    const [selectedResult, setSelectedResult] =
        useState<ReturnSearchType | null>(null)
    const [quantityInput, setQuantityInput] = useState(defaultQuantity || 1)
    const [priceInput, setPriceInput] = useState<number | undefined>(
        type === 'purchase' ? 0 : undefined
    )

    const searchFunction = searchGoodsMasters
    const searchByIdFunction = findGoodsMasterByBarcode

    const onSearchChanged = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value
        setSearchValue(value)
        if (searchFunction) {
            setSearchResults(await searchFunction(value, 1, 10))
        }
    }

    const onSearchClicked = async () => {
        if (searchFunction) {
            setSearchResults(await searchFunction(searchValue, 1, 10))
        }
    }

    const onBarcodeScanned = async () => {
        try {
            if (searchByIdFunction) {
                const result = await searchByIdFunction(selectedId)
                setSelectedResult(result)
            }
        } catch (err) {
            if (err instanceof Error) return toast.error(err.message)

            return toast.error('Something went wrong')
        }
    }

    const mapSearchResults = (searchResults: ReturnSearchType[]) => {
        return searchResults.map((result) => {
            return {
                id: result.id,
                name: result.name,
            }
        })
    }

    useEffect(() => {
        async function initial(defaultBarcode: string) {
            const result = await searchByIdFunction(defaultBarcode)
            setSelectedResult(result)
        }
        if (!selectedResult && defaultBarcode) {
            initial(defaultBarcode)
        }
        if (!selectedResult) return

        setItems((prev) => {
            if (prev.find((item) => item.rowId === rowId))
                return prev.map((item) =>
                    item.rowId === rowId
                        ? {
                              ...selectedResult,
                              quantity: quantityInput,
                              price: priceInput,
                              rowId: rowId,
                          }
                        : item
                )

            return [
                ...prev,
                {
                    ...selectedResult,
                    quantity: quantityInput,
                    price: priceInput,
                    rowId: rowId,
                },
            ]
        })

        return () => {
            setItems((prev) => prev.filter((item) => item.rowId !== rowId))
        }
    }, [
        defaultBarcode,
        priceInput,
        quantityInput,
        rowId,
        searchByIdFunction,
        selectedResult,
        setItems,
    ])

    return (
        <>
            <TableRow id={rowId}>
                <TableCell>
                    <Popover
                        open={isOpen}
                        onOpenChange={(bool) => {
                            setIsOpen(bool)
                            if (!bool)
                                document
                                    .getElementsByName('barcode')
                                    [
                                        totalRows.findIndex(
                                            (row) => row === rowId
                                        )
                                    ]?.focus()
                        }}
                    >
                        <span className="flex flex-col gap-1">
                            <span className="relative">
                                <Input
                                    name={'barcode'}
                                    id={`input-${rowId}`}
                                    value={selectedId}
                                    onChange={(e) =>
                                        setSelectedId(e.target.value)
                                    }
                                    onKeyDown={async (e) => {
                                        if (e.key === '?' || e.key === 'ฦ') {
                                            e.preventDefault()
                                            setIsOpen(true)
                                            return
                                        }
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            return await onBarcodeScanned()
                                        }

                                        if (e.key === 'ArrowDown') {
                                            if (
                                                rowId ===
                                                    totalRows[
                                                        totalRows.length - 1
                                                    ] &&
                                                selectedResult &&
                                                onInsertRow
                                            ) {
                                                e.preventDefault()
                                                onInsertRow()
                                                return
                                            }

                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault()
                                                document
                                                    .getElementsByName(
                                                        'barcode'
                                                    )
                                                    [
                                                        totalRows.findIndex(
                                                            (id) => id === rowId
                                                        ) + 1
                                                    ]?.focus()
                                            }
                                        }

                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault()
                                            document
                                                .getElementsByName('barcode')
                                                [
                                                    totalRows.findIndex(
                                                        (id) => id === rowId
                                                    ) - 1
                                                ]?.focus()
                                        }
                                    }}
                                    className={cn(
                                        'w-[240px] justify-start text-left font-normal'
                                    )}
                                ></Input>
                                <PopoverTrigger asChild>
                                    <SearchIcon className="absolute left-[215px] top-1/2 h-4 w-4 -translate-y-1/2 hover:cursor-pointer" />
                                </PopoverTrigger>
                            </span>
                        </span>
                        <PopoverContent
                            className="w-auto"
                            onInteractOutside={(e) => e.preventDefault()}
                            align="start"
                        >
                            <div className="space-x-2">
                                <Input
                                    id="search-sku"
                                    value={searchValue}
                                    onChange={onSearchChanged}
                                    placeholder="Search"
                                    className="w-[240px]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onSearchClicked()
                                        }
                                        const buttons = document
                                            .getElementById(rowId)
                                            ?.ownerDocument.getElementsByName(
                                                'select-button'
                                            )
                                        if (!buttons) return

                                        if (e.key === 'ArrowDown') {
                                            buttons[0]?.focus()
                                        }
                                        if (e.key === 'ArrowUp') {
                                            buttons[buttons.length - 1]?.focus()
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant={'outline'}
                                    onClick={onSearchClicked}
                                >
                                    Search
                                </Button>
                            </div>
                            <Table>
                                <TableCaption>
                                    <PaginationClientComponent
                                        limit={10}
                                        numberOfPage={Math.ceil(
                                            searchResults.length / 10
                                        )}
                                        onPageClick={async (page: number) => {
                                            setPage(page)
                                            setSearchResults(
                                                await searchFunction(
                                                    searchValue,
                                                    page,
                                                    10
                                                )
                                            )
                                        }}
                                        page={page}
                                    />
                                </TableCaption>
                                <TableHeader className="bg-primary-foreground/60 ">
                                    <TableRow>
                                        <TableHead>คงเหลือ</TableHead>
                                        <TableHead>ชื่อสินค้าหลัก</TableHead>
                                        <TableHead>สินค้าย่อย</TableHead>
                                        <TableHead>Barcode</TableHead>
                                        <TableHead>หน่วย</TableHead>
                                        <TableHead>ราคา</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result, i) => (
                                        <Fragment key={result.id}>
                                            {result.SkuMaster.map(
                                                (skuMaster, j) => (
                                                    <Fragment
                                                        key={skuMaster.id}
                                                    >
                                                        {skuMaster.GoodsMaster.map(
                                                            (
                                                                goodsMaster,
                                                                index
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        goodsMaster.barcode
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        {skuMaster.SkuIn.reduce(
                                                                            (
                                                                                prev,
                                                                                curr
                                                                            ) =>
                                                                                prev +
                                                                                curr.quantity -
                                                                                curr.SkuInToOut.reduce(
                                                                                    (
                                                                                        prev,
                                                                                        curr
                                                                                    ) =>
                                                                                        prev +
                                                                                        curr.quantity,
                                                                                    0
                                                                                ),
                                                                            0
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {index ===
                                                                        0
                                                                            ? result.name
                                                                            : ''}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            skuMaster.detail
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            goodsMaster.barcode
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>{`${goodsMaster.unit}(${goodsMaster.quantityPerUnit})`}</TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            goodsMaster.pricePerUnit
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            type="button"
                                                                            variant={
                                                                                'outline'
                                                                            }
                                                                            id={`button-${indexIJK(
                                                                                {
                                                                                    i,
                                                                                    j,
                                                                                    k: index,
                                                                                },
                                                                                searchResults.map(
                                                                                    (
                                                                                        result
                                                                                    ) =>
                                                                                        result.SkuMaster.map(
                                                                                            (
                                                                                                skuMaster
                                                                                            ) =>
                                                                                                skuMaster.GoodsMaster.map(
                                                                                                    (
                                                                                                        goodsMaster
                                                                                                    ) =>
                                                                                                        goodsMaster
                                                                                                )
                                                                                        )
                                                                                )
                                                                            )}`}
                                                                            name="select-button"
                                                                            onKeyDown={(
                                                                                e
                                                                            ) => {
                                                                                const array4D =
                                                                                    searchResults.map(
                                                                                        (
                                                                                            result
                                                                                        ) =>
                                                                                            result.SkuMaster.map(
                                                                                                (
                                                                                                    skuMaster
                                                                                                ) =>
                                                                                                    skuMaster.GoodsMaster.map(
                                                                                                        (
                                                                                                            goodsMaster
                                                                                                        ) =>
                                                                                                            goodsMaster
                                                                                                    )
                                                                                            )
                                                                                    )
                                                                                const rowIndex =
                                                                                    indexIJK(
                                                                                        {
                                                                                            i,
                                                                                            j,
                                                                                            k: index,
                                                                                        },
                                                                                        array4D
                                                                                    )

                                                                                if (
                                                                                    e.key ===
                                                                                    'ArrowUp'
                                                                                ) {
                                                                                    if (
                                                                                        rowIndex
                                                                                    )
                                                                                        document
                                                                                            .getElementById(
                                                                                                rowId
                                                                                            )
                                                                                            ?.ownerDocument.getElementById(
                                                                                                `button-${rowIndex - 1}`
                                                                                            )
                                                                                            ?.focus()

                                                                                    if (
                                                                                        !rowIndex
                                                                                    )
                                                                                        document
                                                                                            .getElementById(
                                                                                                rowId
                                                                                            )
                                                                                            ?.ownerDocument.getElementById(
                                                                                                'search-sku'
                                                                                            )
                                                                                            ?.focus()
                                                                                }
                                                                                if (
                                                                                    e.key ===
                                                                                    'ArrowDown'
                                                                                ) {
                                                                                    if (
                                                                                        rowIndex ===
                                                                                        lengthOfArray4D(
                                                                                            array4D
                                                                                        ) -
                                                                                            1
                                                                                    ) {
                                                                                        document
                                                                                            .getElementById(
                                                                                                rowId
                                                                                            )
                                                                                            ?.ownerDocument.getElementById(
                                                                                                'search-sku'
                                                                                            )
                                                                                            ?.focus()
                                                                                    }

                                                                                    if (
                                                                                        !(
                                                                                            rowIndex ===
                                                                                            lengthOfArray4D(
                                                                                                array4D
                                                                                            ) -
                                                                                                1
                                                                                        )
                                                                                    )
                                                                                        document
                                                                                            .getElementById(
                                                                                                `button-${rowIndex + 1}`
                                                                                            )
                                                                                            ?.focus()
                                                                                }
                                                                            }}
                                                                            onClick={() => {
                                                                                setSelectedId(
                                                                                    goodsMaster.barcode
                                                                                )
                                                                                setSelectedResult(
                                                                                    {
                                                                                        ...result,
                                                                                        SkuMaster:
                                                                                            [
                                                                                                {
                                                                                                    ...result
                                                                                                        .SkuMaster[
                                                                                                        index
                                                                                                    ],
                                                                                                    GoodsMaster:
                                                                                                        [
                                                                                                            goodsMaster,
                                                                                                        ],
                                                                                                },
                                                                                            ],
                                                                                    }
                                                                                )

                                                                                setIsOpen(
                                                                                    false
                                                                                )

                                                                                document
                                                                                    .getElementsByName(
                                                                                        'quantity'
                                                                                    )
                                                                                    [
                                                                                        totalRows.findIndex(
                                                                                            (
                                                                                                id
                                                                                            ) =>
                                                                                                id ===
                                                                                                rowId
                                                                                        )
                                                                                    ]?.focus()
                                                                            }}
                                                                        >
                                                                            เลือก
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </Fragment>
                                                )
                                            )}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </PopoverContent>
                    </Popover>
                </TableCell>
                <TableCell>
                    <Popover>
                        <PopoverTrigger asChild>
                            <p className="min-w-[300px]">
                                {selectedResult && selectedResult.name}
                            </p>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                            <div className="grid w-[500px] grid-cols-3 gap-1">
                                {selectedResult &&
                                    selectedResult?.SkuMaster[0]?.Image.map(
                                        (image) => (
                                            <Image
                                                unoptimized
                                                src={image.path}
                                                key={image.path}
                                                width={500}
                                                height={500}
                                                alt={selectedResult.name}
                                            />
                                        )
                                    )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </TableCell>
                <TableCell className="text-right">
                    <Input
                        name="quantity"
                        className="text-right"
                        type="number"
                        value={quantityInput}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                            setQuantityInput(+e.target.value)
                        }}
                        onKeyDown={(e) => {
                            if (!onInsertRow) return

                            if (e.key === 'Tab' || e.key === 'ArrowDown') {
                                if (type === 'purchase' && e.key === 'Tab')
                                    return

                                if (
                                    rowId === totalRows[totalRows.length - 1] &&
                                    selectedResult
                                ) {
                                    e.preventDefault()
                                    onInsertRow()
                                    return
                                }

                                if (e.key === 'Tab' && type === 'sales') {
                                    e.preventDefault()
                                    document
                                        .getElementsByName('barcode')
                                        [
                                            totalRows.findIndex(
                                                (id) =>
                                                    id === rowId &&
                                                    rowId !==
                                                        totalRows[
                                                            totalRows.length - 1
                                                        ]
                                            ) + 1
                                        ]?.focus()
                                }

                                if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    document
                                        .getElementsByName('quantity')
                                        [
                                            totalRows.findIndex(
                                                (id) => id === rowId
                                            ) + 1
                                        ]?.focus()
                                }
                            }

                            if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                document
                                    .getElementsByName('quantity')
                                    [
                                        totalRows.findIndex(
                                            (id) => id === rowId
                                        ) - 1
                                    ]?.focus()
                            }
                        }}
                    />
                </TableCell>
                <TableCell className="text-right">
                    {selectedResult &&
                        `${selectedResult?.SkuMaster[0]?.GoodsMaster[0].unit}(${selectedResult?.SkuMaster[0]?.GoodsMaster[0].quantity})`}
                </TableCell>
                <TableCell className="text-right">
                    {selectedResult &&
                        type === 'sales' &&
                        selectedResult?.SkuMaster[0]?.GoodsMaster[0].price}
                    {type !== 'sales' && (
                        <Input
                            name="price"
                            type="number"
                            value={priceInput}
                            onChange={(e) => {
                                setPriceInput(+e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (!onInsertRow) return

                                if (e.key === 'Tab' || e.key === 'ArrowDown') {
                                    if (
                                        rowId ===
                                            totalRows[totalRows.length - 1] &&
                                        selectedResult
                                    ) {
                                        e.preventDefault()
                                        onInsertRow()
                                        return
                                    }

                                    if (e.key === 'Tab') {
                                        e.preventDefault()
                                        document
                                            .getElementsByName('barcode')
                                            [
                                                totalRows.findIndex(
                                                    (id) =>
                                                        id === rowId &&
                                                        rowId !==
                                                            totalRows[
                                                                totalRows.length -
                                                                    1
                                                            ]
                                                ) + 1
                                            ]?.focus()
                                    }

                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault()
                                        document
                                            .getElementsByName('quantity')
                                            [
                                                totalRows.findIndex(
                                                    (id) => id === rowId
                                                ) + 1
                                            ]?.focus()
                                    }
                                }

                                if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    document
                                        .getElementsByName('quantity')
                                        [
                                            totalRows.findIndex(
                                                (id) => id === rowId
                                            ) - 1
                                        ]?.focus()
                                }
                            }}
                        />
                    )}
                </TableCell>
                <TableCell className="text-right">
                    {selectedResult &&
                        type === 'sales' &&
                        selectedResult?.SkuMaster[0]?.GoodsMaster[0].price *
                            quantityInput}
                    {type !== 'sales' &&
                        priceInput &&
                        (priceInput * quantityInput).toLocaleString()}
                </TableCell>
                <TableCell>
                    {selectedResult && totalRows.length === 1 ? (
                        <Cross1Icon
                            className="font-bold text-destructive hover:cursor-pointer"
                            onClick={() => {
                                setSelectedResult(null)
                                setSelectedId('')
                                document
                                    .getElementsByName('barcode')[0]
                                    ?.focus()
                            }}
                        ></Cross1Icon>
                    ) : selectedResult ? (
                        <Cross1Icon
                            className="font-bold text-destructive hover:cursor-pointer"
                            onClick={() => {
                                setTotalRows(
                                    totalRows.filter((id) => id !== rowId)
                                )
                            }}
                        ></Cross1Icon>
                    ) : totalRows[0] === rowId ? (
                        <></>
                    ) : (
                        <Cross1Icon
                            className="font-bold text-destructive hover:cursor-pointer"
                            onClick={() => {
                                setTotalRows(
                                    totalRows.filter((id) => id !== rowId)
                                )
                            }}
                        ></Cross1Icon>
                    )}
                </TableCell>
            </TableRow>
        </>
    )
}
