'use client'

import React, { useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchSkuTreeByKeyword } from '@/actions/search-sku-tree-query'

import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { SkuTree } from '@/types/sku-tree/sku-tree'
import Link from 'next/link'

type Props = {}

export default function QuickSearchInventory({}: Props) {
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [searchItems, setSearchItems] = React.useState<SkuTree>({
        items: [],
        count: 0,
    })

    const handleSearch = async () => {
        const result = await searchSkuTreeByKeyword(searchKeyword, 1)
        setSearchItems(result)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'KeyF' && event.ctrlKey) {
            setOpen(true)
            ref.current?.focus()
            event.preventDefault()
        }
    }
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const ref = React.useRef<HTMLInputElement>(null)

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={ref}
                            type="search"
                            placeholder="Search products..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            value={searchKeyword}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch()
                                    setOpen(true)
                                }
                            }}
                            // onFocusCapture={() => setOpen(true)}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                    onEscapeKeyDown={() => setOpen(false)}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    // onFocusOutside={() => setOpen(false)}
                >
                    <Command>
                        <CommandList>
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup heading="สินค้า">
                                {searchItems.items.map((item, index) => (
                                    <CommandItem
                                        key={index}
                                        value={`${item.mainSkuId}`}
                                        onSelect={() => {}}
                                    >
                                        <Link
                                            href={`/inventory/${item.mainSkuId}`}
                                            target="_blank"
                                        >
                                            {item.name}{' '}
                                            <span className="text-primary/50">
                                                {item.partNumber
                                                    ? ` - ${item.partNumber}`
                                                    : ''}
                                            </span>
                                        </Link>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    )
}
