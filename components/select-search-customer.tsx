'use client'

import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Input } from './ui/input'
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
import { Textarea } from './ui/textarea'
import toast from 'react-hot-toast'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { searchAccountReceivable } from '@/app/actions/contact/searchAccountReceivable'
import { searchAccountReceivableById } from '@/app/actions/contact/searchAccountReceivableById'
import { Contact } from '@prisma/client'

type Props<T> = {
    name?: string
    page?: string
    limit?: string
    caption?: string
    hasTextArea?: boolean
}

type Payment = 'cash' | 'transfer' | 'credit'

export default function SelectSearchCustomer<T>({
    name = 'customerId',
    page = '1',
    limit = '10',
    caption,
    hasTextArea,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<Contact[]>([])
    const [selectedId, setSelectedId] = useState<string>('')
    const [selectedResult, setSelectedResult] = useState<Contact>()
    const [textArea, setTextArea] = useState<string>('')
    const [credit, setCredit] = useState<Payment>('cash')

    const onSearchChanged = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value
        setSearchValue(value)
        if (searchAccountReceivable) {
            setSearchResults(await searchAccountReceivable(value, page, limit))
        }
    }

    const onSearchClicked = async () => {
        if (searchAccountReceivable) {
            setSearchResults(
                await searchAccountReceivable(searchValue, page, limit)
            )
        }
    }

    const setTextAreaFromData = (data: Contact) => {
        setTextArea(`${data.name}`)
    }

    return (
        <>
            <Popover
                open={isOpen}
                onOpenChange={(bool) => {
                    setIsOpen(bool)
                    if (!bool)
                        document.getElementsByName(name || '')[0]?.focus()
                }}
            >
                <span className="relative flex flex-col items-end gap-1">
                    <span className="relative">
                        <Input
                            name={name}
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.shiftKey && e.code === 'Slash') {
                                    e.preventDefault()
                                    setIsOpen(true)
                                    return
                                }
                                if (
                                    e.key === 'Enter' &&
                                    searchAccountReceivableById
                                ) {
                                    e.preventDefault()
                                    try {
                                        const result =
                                            await searchAccountReceivableById(
                                                selectedId
                                            )
                                        setTextAreaFromData(result)
                                        setSelectedResult(result)
                                    } catch (err) {
                                        if (err instanceof Error) {
                                            return toast.error(err.message)
                                        }
                                        return toast.error(
                                            'Something went wrong'
                                        )
                                    }
                                }
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
                            onChange={(e) => setTextArea(e.target.value)}
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
                                <TableHead>Id</TableHead>
                                <TableHead>ชื่อลูกค้า</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {searchResults.map((result, index) => (
                                <TableRow
                                    key={(result as any).id || index}
                                    onClick={() => {
                                        setSelectedId((result as any).id)
                                        setSelectedResult(result)
                                        setTextAreaFromData(result)
                                        setIsOpen(false)
                                    }}
                                >
                                    <TableCell>{result.id}</TableCell>
                                    <TableCell>{result.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </PopoverContent>
            </Popover>
            <input type="text" hidden value={credit} name="payment" readOnly />
            {selectedResult && selectedResult.credit && (
                <ToggleGroup
                    type="single"
                    defaultValue="cash"
                    onValueChange={(e: Payment) => setCredit(e)}
                >
                    <ToggleGroupItem value="cash">Cash</ToggleGroupItem>
                    <ToggleGroupItem value="transfer">Transfer</ToggleGroupItem>
                    <ToggleGroupItem value="credit">Credit</ToggleGroupItem>
                </ToggleGroup>
            )}
        </>
    )
}
