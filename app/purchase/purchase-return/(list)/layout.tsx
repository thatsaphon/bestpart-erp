import DateRangePickerSearchParams from '@/components/date-range-picker-search-params'
import SubMenuNavLink from '@/components/submenu-navlink'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'รายการใบคืนสินค้าแก่ผู้จำหน่าย',
}

export default async function PurchaseReturnLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <h1 className="mb-2 flex items-center gap-2 text-3xl text-primary">
                <span>รายการใบคืนสินค้าแก่ผู้จำหน่าย</span>
                <Link href={'/purchase/purchase-return/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างใบคืน
                    </Button>
                </Link>
            </h1>
            <DateRangePickerSearchParams />
            {children}
        </>
    )
}
