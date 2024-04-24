'use client'

import React, { Fragment, ReactNode, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from '@radix-ui/react-icons'
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

type Props = {
    name?: string
    // type?: T
    // searchFunction?: (
    //     value: string,
    //     page?: string,
    //     limit?: string
    // ) => Promise<T[]>
    // searchByIdFunction?: (id: string) => Promise<T>
    // keys?: (keyof T)[]
    keysMap?: { [key: string]: string }
    page?: string
    limit?: string
    caption?: string
    hasTextArea?: boolean
    onInsertRow?: () => void
    rowId: string
    totalRows: string[]
    // textAreaKeys?: (keyof T)[]
}

type ReturnSearchType = Awaited<ReturnType<typeof findGoodsMasterByBarcode>>

export default function SelectSearchMainSku({
    name,
    // searchFunction,
    // searchByIdFunction,
    // keys = [],
    page = '1',
    limit = '10',
    caption,
    hasTextArea,
    onInsertRow,
    rowId,
    totalRows,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<ReturnSearchType[]>([])
    const [selectedId, setSelectedId] = useState<string>('')
    const [selectedResult, setSelectedResult] =
        useState<ReturnSearchType | null>(null)

    const [quantityInput, setQuantityInput] = useState(1)

    const [textArea, setTextArea] = useState<string>('')

    const searchFunction = searchGoodsMasters
    const searchByIdFunction = findGoodsMasterByBarcode

    const onSearchChanged = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value
        setSearchValue(value)
        if (searchFunction) {
            setSearchResults(await searchFunction(value, page, limit))
        }
    }

    const onSearchClicked = async () => {
        if (searchFunction) {
            setSearchResults(await searchFunction(searchValue, page, limit))
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

    return (
        <>
            <TableRow>
                <TableCell>
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <span className="relative flex flex-col items-end gap-1">
                            <span className="relative">
                                <Input
                                    name={barcode}
                                    id={rowId}
                                    value={selectedId}
                                    onChange={(e) =>
                                        setSelectedId(e.target.value)
                                    }
                                    onKeyDown={async (e) => {
                                        if (!onInsertRow) return

                                        if (
                                            e.key === 'Tab' ||
                                            e.key === 'ArrowDown'
                                        ) {
                                            if (
                                                rowId ===
                                                totalRows[totalRows.length - 1]
                                            ) {
                                                e.preventDefault()
                                                onInsertRow()
                                                return
                                            }

                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault()
                                                console.log(
                                                    document
                                                        .getElementsByName(
                                                            'barcode'
                                                        )
                                                        [
                                                            totalRows.findIndex(
                                                                (id) =>
                                                                    id === rowId
                                                            ) + 1
                                                        ]?.focus()
                                                )
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
                                        // if (
                                        //     e.key === 'Enter' &&
                                        //     searchByIdFunction
                                        // ) {
                                        //     console.log(
                                        //         (e.target as HTMLInputElement)
                                        //             .value
                                        //     )

                                        //     try {
                                        //         const result =
                                        //             await searchByIdFunction(
                                        //                 selectedId
                                        //             )
                                        //         console.log(result)
                                        //         setSelectedResult(result)
                                        //     } catch (err) {
                                        //         if (err instanceof Error) {
                                        //             return toast.error(
                                        //                 err.message
                                        //             )
                                        //         }
                                        //         return toast.error(
                                        //             'Something went wrong'
                                        //         )
                                        //     }
                                        // }
                                        // if (
                                        //     e.key === 'ArrowDown' &&
                                        //     onInsertRow
                                        // ) {
                                        //     e.preventDefault()
                                        //     if (
                                        //         rowId ===
                                        //         totalRows[totalRows.length - 1]
                                        //     ) {
                                        //         onInsertRow()
                                        //     }
                                        // }
                                    }}
                                    className={cn(
                                        'w-[240px] justify-start text-left font-normal'
                                    )}
                                ></Input>
                                <PopoverTrigger asChild>
                                    <SearchIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 hover:cursor-pointer" />
                                </PopoverTrigger>
                            </span>
                            {hasTextArea && (
                                <Textarea
                                    value={textArea}
                                    className="float-right w-[240px] justify-end text-left font-normal"
                                    onChange={(e) =>
                                        setTextArea(e.target.value)
                                    }
                                />
                            )}
                        </span>
                        <PopoverContent
                            className="w-auto"
                            onInteractOutside={(e) => e.preventDefault()}
                            align="start"
                        >
                            <div className="space-x-2">
                                <Input
                                    value={searchValue}
                                    onChange={onSearchChanged}
                                    placeholder="Search"
                                    className="w-[240px]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            onSearchClicked()
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
                                <TableCaption>{caption}</TableCaption>
                                <TableHeader className="bg-primary-foreground/60 ">
                                    <TableRow>
                                        <TableHead>คงเหลือ</TableHead>
                                        <TableHead>ชื่อสินค้าหลัก</TableHead>
                                        <TableHead>สินค้าย่อย</TableHead>
                                        <TableHead>Barcode</TableHead>
                                        <TableHead>หน่วย</TableHead>
                                        <TableHead>ราคา</TableHead>
                                        {/* {keys.map((key) => (
                                    <TableHead key={key as string}>
                                        {keysMap
                                            ? keysMap[key as string]
                                            : (key as string)}
                                    </TableHead>
                                ))} */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result) => (
                                        <Fragment key={result.id}>
                                            {result.skuMasters.map(
                                                (skuMaster) => (
                                                    <Fragment
                                                        key={skuMaster.id}
                                                    >
                                                        {skuMaster.goodsMasters.map(
                                                            (
                                                                goodsMaster,
                                                                index
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        goodsMaster.barcode
                                                                    }
                                                                    onClick={() => {
                                                                        setSelectedId(
                                                                            goodsMaster.barcode
                                                                        )
                                                                        setSelectedResult(
                                                                            {
                                                                                ...result,
                                                                                skuMasters:
                                                                                    [
                                                                                        {
                                                                                            ...result
                                                                                                .skuMasters[
                                                                                                index
                                                                                            ],
                                                                                            goodsMasters:
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
                                                                    }}
                                                                >
                                                                    <TableCell>
                                                                        {skuMaster.skuMovements.reduce(
                                                                            (
                                                                                prev,
                                                                                curr
                                                                            ) =>
                                                                                prev +
                                                                                curr.quantity,
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
                                                                    <TableCell>{`${goodsMaster.unit}(${goodsMaster.quantity})`}</TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            goodsMaster.price
                                                                        }
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
                                    selectedResult?.skuMasters[0]?.images.map(
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
                        onChange={(e) => setQuantityInput(+e.target.value)}
                        onKeyDown={(e) => {
                            if (!onInsertRow) return

                            if (e.key === 'Tab' || e.key === 'ArrowDown') {
                                if (rowId === totalRows[totalRows.length - 1]) {
                                    e.preventDefault()
                                    onInsertRow()
                                    return
                                }

                                if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    console.log(
                                        document
                                            .getElementsByName('quantity')
                                            [
                                                totalRows.findIndex(
                                                    (id) => id === rowId
                                                ) + 1
                                            ]?.focus()
                                    )
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
                        `${selectedResult?.skuMasters[0]?.goodsMasters[0].unit}(${selectedResult?.skuMasters[0]?.goodsMasters[0].quantity})`}
                </TableCell>
                <TableCell className="text-right">
                    {selectedResult &&
                        selectedResult?.skuMasters[0]?.goodsMasters[0].price}
                </TableCell>
                <TableCell className="text-right">
                    {selectedResult &&
                        selectedResult?.skuMasters[0]?.goodsMasters[0].price *
                            quantityInput}
                </TableCell>
            </TableRow>
        </>
    )
}
