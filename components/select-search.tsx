'use client'

import React, { ReactNode, useState } from 'react'
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

type Props<T> = {
    name?: string
    type?: T
    searchFunction?: (
        value: string,
        page?: string,
        limit?: string
    ) => Promise<T[]>
    searchByIdFunction?: (id: string) => Promise<T>
    keys?: (keyof T)[]
    keysMap?: { [key: string]: string }
    page?: string
    limit?: string
    caption?: string
    hasTextArea?: boolean
    textAreaKeys?: (keyof T)[]
}

export default function SelectSearch<T>({
    name,
    searchFunction,
    searchByIdFunction,
    keys = [],
    keysMap,
    page = '1',
    limit = '10',
    caption,
    hasTextArea,
    textAreaKeys = [],
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<T[]>([])
    const [selectedId, setSelectedId] = useState<string>('')
    const [textArea, setTextArea] = useState<string>('')

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

    const setTextAreaFromData = (data: T) => {
        for (const key of textAreaKeys) {
            setTextArea((prev) => {
                return prev + data[key] + '\n'
            })
        }
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <span className="relative flex flex-col items-end gap-1">
                    <span className="relative">
                        <Input
                            name={name}
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && searchByIdFunction) {
                                    console.log(
                                        (e.target as HTMLInputElement).value
                                    )

                                    try {
                                        const result =
                                            await searchByIdFunction(selectedId)
                                        setTextAreaFromData(result)
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
                                {keys.map((key) => (
                                    <TableHead key={key as string}>
                                        {keysMap
                                            ? keysMap[key as string]
                                            : (key as string)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {searchResults.map((result, index) => (
                                <TableRow
                                    key={(result as any).id || index}
                                    onClick={() => {
                                        setSelectedId((result as any).id)
                                        setTextAreaFromData(result)
                                        setIsOpen(false)
                                    }}
                                >
                                    {keys.map((key, i) => (
                                        <TableCell
                                            key={`key-${(result as any).id}${i}`}
                                        >
                                            {result[key] as ReactNode}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </PopoverContent>
            </Popover>
        </>
    )
}