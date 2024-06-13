import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Button } from '@/components/ui/button'
import { searchSku } from './search-sku'
import toast from 'react-hot-toast'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import PaginationClientComponent from '@/components/pagination-client-component'
import { InventoryDetailType } from '@/types/inventory-detail'
import ImageToolTip from '@/components/image-tooltip'

type Props = {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    children?: React.ReactNode
    onSelected: (data: InventoryDetailType) => void
}

export default function SearchSkuDialog({
    isOpen,
    setIsOpen,
    children,
    onSelected,
}: Props) {
    const [searchItems, setSearchItems] = React.useState<InventoryDetailType[]>(
        []
    )
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [page, setPage] = React.useState(1)
    const [count, setCount] = React.useState(0)
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children && <DialogTrigger>{children}</DialogTrigger>}
            <DialogContent className="w-auto min-w-[70vw] max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>ค้นหาสินค้า</DialogTitle>
                </DialogHeader>
                <div className="space-x-2">
                    <Input
                        id="search-sku"
                        placeholder="Search"
                        className="w-[240px]"
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                try {
                                    console.log(searchKeyword)
                                    const result = await searchSku(
                                        e.currentTarget.value
                                    )
                                    setSearchItems(result.items)
                                    setCount(result.count)
                                } catch (error) {
                                    if (error instanceof Error)
                                        return toast.error(error.message)
                                    toast.error('Something went wrong')
                                }
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant={'outline'}
                        onClick={async () => {
                            try {
                                const result = await searchSku(searchKeyword)
                                setSearchItems(result.items)
                                setCount(result.count)
                            } catch (error) {
                                if (error instanceof Error)
                                    return toast.error(error.message)
                                toast.error('Something went wrong')
                            }
                        }}
                    >
                        Search
                    </Button>
                </div>
                <Table>
                    <TableCaption>
                        <PaginationClientComponent
                            limit={10}
                            numberOfPage={Math.ceil(count / 10)}
                            onPageClick={async (page: number) => {
                                try {
                                    const result = await searchSku(
                                        searchKeyword,
                                        page
                                    )
                                    setSearchItems(result.items)
                                    setPage(page)
                                } catch (error) {
                                    toast.error('Something went wrong')
                                }
                            }}
                            page={page}
                        />
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[50px] text-center">
                                คงเหลือ
                            </TableHead>
                            <TableHead>Barcode</TableHead>
                            <TableHead className="min-w-[350px]">
                                Name
                            </TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchItems.map((item) => (
                            <TableRow key={item.barcode}>
                                <TableCell className="text-center">
                                    {item.remaining}
                                </TableCell>
                                <TableCell>{item.barcode}</TableCell>
                                <TableCell className="w-[350px]">
                                    <p>{item.name}</p>
                                    <p className="text-primary/50">
                                        {item.detail}
                                    </p>
                                    <p className="text-primary/50">
                                        {item.partNumber}
                                    </p>
                                    <p>
                                        <ImageToolTip images={item.images} />
                                    </p>
                                </TableCell>
                                <TableCell>{`${item.unit}(${item.quantityPerUnit})`}</TableCell>
                                <TableCell className="text-right">
                                    {item.price}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant={'outline'}
                                        onClick={() => onSelected(item)}
                                    >
                                        เลือก
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}
