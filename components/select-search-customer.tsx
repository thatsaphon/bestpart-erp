'use client'

import React, {
    Dispatch,
    Fragment,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
} from 'react'
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
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { createNewContact } from '@/app/actions/contact/createNewContact'
import PaginationClientComponent from './pagination-client-component'

type Props<T> = {
    name?: string
    hasTextArea?: boolean
    placeholder?: string
    defaultValue?: string
    defaultAddress?: InvoiceAddress
    disabled?: boolean
    canCreateNewCustomer?: boolean
}

type InvoiceAddress = {
    name: string
    address: string
    phone: string
    taxId: string
}
type Payment = 'cash' | 'transfer' | 'credit'

type PopoverType = 'search' | 'create'

export default function SelectSearchCustomer<T>({
    name = 'customerId',
    hasTextArea,
    placeholder,
    defaultValue,
    disabled,
    defaultAddress,
    canCreateNewCustomer,
}: Props<T>) {
    const [page, setPage] = useState(1)
    const [isOpen, setIsOpen] = useState(false)
    const [popoverType, setPopoverType] = useState<PopoverType>('search')
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<Contact[]>([])
    const [selectedId, setSelectedId] = useState<string>(defaultValue || '')
    const [selectedResult, setSelectedResult] = useState<Contact>()
    const [address, setAddress] = useState<InvoiceAddress>(
        defaultAddress || {
            name: '',
            address: '',
            phone: '',
            taxId: '',
        }
    )
    const [credit, setCredit] = useState<Payment>('cash')

    const onSearchChanged = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value
        setSearchValue(value)
        if (searchAccountReceivable) {
            setSearchResults(await searchAccountReceivable(value, 1, 10))
        }
    }

    const onSearchClicked = async () => {
        if (searchAccountReceivable) {
            setSearchResults(await searchAccountReceivable(searchValue, 1, 10))
        }
    }

    useEffect(() => {
        async function fetchCustomerData(customerId: string) {
            if (defaultValue) {
                try {
                    const result =
                        await searchAccountReceivableById(+customerId)
                    setSelectedResult(result)
                } catch (err) {
                    if (err instanceof Error) {
                        if (err.message === 'NEXT_REDIRECT') {
                            toast.success('บันทึกสําเร็จ')
                            return
                        }
                        toast.error(err.message)
                        return
                    }
                    toast.error('Something went wrong')
                }
            }
        }
        fetchCustomerData(defaultValue || '')
    }, [defaultValue])

    const setTextAreaFromData = (data: Contact) => {
        setAddress({
            name: data.name,
            address: data.address,
            phone: data.phone,
            taxId: data.taxId || '',
        })
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
                <span className="grid w-[500px] grid-cols-2 gap-1">
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
                                                +selectedId
                                            )
                                        setTextAreaFromData(result)
                                        setSelectedResult(result)
                                    } catch (err) {
                                        if (err instanceof Error) {
                                            if (
                                                err.message === 'NEXT_REDIRECT'
                                            ) {
                                                toast.success('บันทึกสําเร็จ')
                                                return
                                            }
                                            toast.error(err.message)
                                            return
                                        }
                                        toast.error('Something went wrong')
                                    }
                                }
                            }}
                            className={cn(
                                'w-[240px] justify-start text-left font-normal'
                            )}
                            placeholder={placeholder}
                            disabled={disabled}
                        />
                        <PopoverTrigger
                            asChild
                            onClick={(e) => {
                                if (popoverType === 'create' && isOpen)
                                    e.preventDefault()
                                setPopoverType('search')
                            }}
                        >
                            <SearchIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 hover:cursor-pointer" />
                        </PopoverTrigger>
                        {canCreateNewCustomer && (
                            <PopoverTrigger
                                asChild
                                onClick={(e) => {
                                    if (popoverType === 'search' && isOpen)
                                        e.preventDefault()
                                    setPopoverType('create')
                                }}
                            >
                                {!disabled && (
                                    <Button
                                        variant={'outline'}
                                        type="button"
                                        className="absolute top-1/2 ml-1 -translate-y-1/2 hover:cursor-pointer"
                                    >
                                        สร้างลูกค้า
                                    </Button>
                                )}
                            </PopoverTrigger>
                        )}
                    </span>
                    {hasTextArea && (
                        <>
                            <div className="col-start-1">
                                <Input
                                    name="contactName"
                                    placeholder="ชื่อลูกค้า"
                                    value={address.name}
                                    onChange={(e) =>
                                        setAddress((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    disabled={disabled}
                                />
                                <Textarea
                                    value={address.address}
                                    name="address"
                                    placeholder="ที่อยู่"
                                    className="col-start-1 row-span-2"
                                    onChange={(e) =>
                                        setAddress((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                    disabled={disabled}
                                />
                            </div>
                            <div>
                                <Input
                                    name="phone"
                                    placeholder="เบอร์โทร"
                                    value={address.phone}
                                    onChange={(e) =>
                                        setAddress((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    disabled={disabled}
                                />
                                <Input
                                    name="taxId"
                                    placeholder="taxId"
                                    value={address.taxId}
                                    onChange={(e) =>
                                        setAddress((prev) => ({
                                            ...prev,
                                            taxId: e.target.value,
                                        }))
                                    }
                                    disabled={disabled}
                                />
                            </div>
                        </>
                    )}
                </span>
                {popoverType === 'search' && (
                    <PopoverContent
                        className="w-auto"
                        onInteractOutside={(e) => e.preventDefault()}
                        align="start"
                    >
                        <div className="space-x-2">
                            <Input
                                id="search-customer"
                                value={searchValue}
                                onChange={onSearchChanged}
                                placeholder="Search"
                                className="w-[240px]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onSearchClicked()
                                    }
                                    if (e.key === 'ArrowDown') {
                                        document
                                            .getElementById('button-0')
                                            ?.focus()
                                    }
                                    if (e.key === 'ArrowUp') {
                                        const buttons =
                                            document.getElementsByName(
                                                'select-button'
                                            )
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
                                {' '}
                                <PaginationClientComponent
                                    limit={10}
                                    numberOfPage={Math.ceil(
                                        searchResults.length / 10
                                    )}
                                    onPageClick={async (page: number) => {
                                        setPage(page)
                                        setSearchResults(
                                            await searchAccountReceivable(
                                                searchValue,
                                                page,
                                                10
                                            )
                                        )
                                    }}
                                    page={page}
                                />
                            </TableCaption>
                            <TableHeader className="bg-primary-foreground/60">
                                <TableRow>
                                    <TableHead>Id</TableHead>
                                    <TableHead>ชื่อลูกค้า</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {searchResults.map((result, index) => (
                                    <TableRow key={(result as any).id || index}>
                                        <TableCell>{result.id}</TableCell>
                                        <TableCell>{result.name}</TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => {
                                                    setSelectedId(
                                                        (result as any).id
                                                    )
                                                    setSelectedResult(result)
                                                    setTextAreaFromData(result)
                                                    setIsOpen(false)
                                                }}
                                                variant={'outline'}
                                                id={`button-${index}`}
                                                name="select-button"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'ArrowUp') {
                                                        if (index)
                                                            document
                                                                .getElementById(
                                                                    `button-${index - 1}`
                                                                )
                                                                ?.focus()

                                                        if (!index)
                                                            document
                                                                .getElementById(
                                                                    'search-customer'
                                                                )
                                                                ?.focus()
                                                    }
                                                    if (e.key === 'ArrowDown') {
                                                        const buttons =
                                                            document.getElementsByName(
                                                                'select-button'
                                                            )
                                                        if (
                                                            index ===
                                                            buttons.length - 1
                                                        )
                                                            document
                                                                .getElementById(
                                                                    'search-customer'
                                                                )
                                                                ?.focus()

                                                        if (
                                                            index !==
                                                            buttons.length - 1
                                                        )
                                                            document
                                                                .getElementById(
                                                                    `button-${index + 1}`
                                                                )
                                                                ?.focus()
                                                    }
                                                }}
                                            >
                                                เลือก
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </PopoverContent>
                )}
                {popoverType === 'create' && (
                    <PopoverContent
                        className="w-auto"
                        onInteractOutside={(e) => e.preventDefault()}
                        align="start"
                    >
                        <form
                            action={async (formData) => {
                                try {
                                    await createNewContact(formData)
                                    toast.success('Create success')
                                    setIsOpen(false)
                                } catch (err) {
                                    if (err instanceof Error)
                                        toast.error(err.message)

                                    toast.error('Something went wrong')
                                }
                            }}
                        >
                            <Label>
                                ชื่อลูกค้า <Input type="text" name="name" />
                            </Label>
                            <Label>
                                ชื่อเต็มสำหรับออกใบกำกับภาษี
                                <Input
                                    type="text"
                                    name="fullName"
                                    placeholder="ปล่อยว่างหากเหมือนกับชื่อข้างบน"
                                />
                            </Label>
                            <Label>
                                เบอร์โทร <Input type="text" name="phone" />
                            </Label>
                            <Label>
                                ที่อยู่ <Textarea name="address" />
                            </Label>
                            <Label>
                                เลขประจำตัวผู้เสียภาษี
                                <Input type="text" name="taxId" />
                            </Label>
                            <Label>
                                คำค้นหา
                                <Input type="text" name="searchKeyword" />
                            </Label>

                            <Separator className="my-3" />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    // formAction={(formData) => {
                                    //     createNewContact(formData)
                                    // }}
                                >
                                    Create
                                </Button>
                            </div>
                        </form>
                    </PopoverContent>
                )}
            </Popover>
            {/* <input type="text" hidden value={credit} name="payment" readOnly />
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
            )} */}
        </>
    )
}
