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
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { useSearchParams } from 'next/navigation'

type Props<T> = {
    label?: string
    name?: string
    hasTextArea?: boolean
    placeholder?: string
    disabled?: boolean
    documentDetail: DocumentDetail
    setDocumentDetail: (documentDetail: DocumentDetail) => void
}

type PopoverType = 'search' | 'create'

export default function SelectSearchContact<T>({
    label = 'ผู้ติดต่อ',
    name = 'customerId',
    hasTextArea,
    placeholder,
    disabled,
    documentDetail,
    setDocumentDetail,
}: Props<T>) {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [isOpen, setIsOpen] = useState(false)
    const [popoverType, setPopoverType] = useState<PopoverType>('search')
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<Contact[]>([])
    const [error, setError] = useState<string | null>(null)
    const [contactId, setContactId] = useState<number | string>(
        documentDetail?.contactId || ''
    )

    useEffect(() => {
        if (searchParams.get('contactId')) {
            setContactId(parseInt(searchParams.get('contactId') as string))
        }
    }, [searchParams])

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

    return (
        <>
            {error && <p className="text-destructive">{error}</p>}
            <div className="my-1 flex items-baseline space-x-2">
                <Label>{label}</Label>
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
                                value={contactId || ''}
                                onChange={(e) => setContactId(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.shiftKey && e.code === 'Slash') {
                                        e.preventDefault()
                                        setIsOpen(true)
                                        return
                                    }
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        try {
                                            if (contactId === '') {
                                                setError(null)
                                                setDocumentDetail(
                                                    getDefaultDocumentDetail()
                                                )
                                                return
                                            }
                                            const result =
                                                await searchAccountReceivableById(
                                                    +contactId
                                                )
                                            setDocumentDetail({
                                                ...documentDetail,
                                                contactId: result.id,
                                                contactName: result.name,
                                                address: result.address,
                                                phone: result.phone,
                                                taxId: result.taxId || '',
                                            })
                                            setError(null)
                                        } catch (err) {
                                            setError(
                                                `ไม่สามารถใช้รหัส ${contactId} ได้`
                                            )
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
                                {/* <SearchIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 hover:cursor-pointer" /> */}
                            </PopoverTrigger>
                        </span>

                        {hasTextArea && (
                            <>
                                <div className="col-start-1">
                                    <Input
                                        name="contactName"
                                        placeholder="ชื่อ"
                                        value={documentDetail.contactName}
                                        onChange={(e) =>
                                            setDocumentDetail({
                                                ...documentDetail,
                                                contactName: e.target.value,
                                            })
                                        }
                                        disabled={disabled}
                                    />
                                    <Textarea
                                        value={documentDetail.address}
                                        name="address"
                                        placeholder="ที่อยู่"
                                        className="col-start-1 row-span-2"
                                        onChange={(e) =>
                                            setDocumentDetail({
                                                ...documentDetail,
                                                address: e.target.value,
                                            })
                                        }
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <Input
                                        name="phone"
                                        placeholder="เบอร์โทร"
                                        value={documentDetail.phone}
                                        onChange={(e) =>
                                            setDocumentDetail({
                                                ...documentDetail,
                                                phone: e.target.value,
                                            })
                                        }
                                        disabled={disabled}
                                    />
                                    <Input
                                        name="taxId"
                                        placeholder="taxId"
                                        value={documentDetail.taxId}
                                        onChange={(e) =>
                                            setDocumentDetail({
                                                ...documentDetail,
                                                taxId: e.target.value,
                                            })
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
                                        >
                                            <TableCell>{result.id}</TableCell>
                                            <TableCell>{result.name}</TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => {
                                                        setDocumentDetail({
                                                            ...documentDetail,
                                                            contactId:
                                                                result.id,
                                                            address:
                                                                result.address,
                                                            contactName:
                                                                result.name,
                                                            phone: result.phone,
                                                            taxId:
                                                                result.taxId ||
                                                                '',
                                                        })
                                                        setContactId(result.id)
                                                        setError(null)
                                                        setIsOpen(false)
                                                    }}
                                                    variant={'outline'}
                                                    id={`button-${index}`}
                                                    name="select-button"
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === 'ArrowUp'
                                                        ) {
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
                                                        if (
                                                            e.key ===
                                                            'ArrowDown'
                                                        ) {
                                                            const buttons =
                                                                document.getElementsByName(
                                                                    'select-button'
                                                                )
                                                            if (
                                                                index ===
                                                                buttons.length -
                                                                    1
                                                            )
                                                                document
                                                                    .getElementById(
                                                                        'search-customer'
                                                                    )
                                                                    ?.focus()

                                                            if (
                                                                index !==
                                                                buttons.length -
                                                                    1
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
            </div>
        </>
    )
}
