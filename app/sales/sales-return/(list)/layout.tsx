import SubMenuNavLink from '@/components/submenu-navlink'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import DateRangePickerSearchParams from '@/components/date-range-picker-search-params'

export const metadata: Metadata = {
    title: 'รายการคืนสินค้า',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>รับคืนสินค้า</span>
                <Link href={'/sales/sales-return/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างใบรับคืนสินค้า
                    </Button>
                </Link>
            </h1>
            <DateRangePickerSearchParams />
            {children}
        </>
    )
}
