import DateRangePickerSearchParams from '@/components/date-range-picker-search-params'
import SubMenuNavLink from '@/components/submenu-navlink'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'รายการใบเสนอราคา',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>รายการใบเสนอราคา</span>
                <Link href={'/sales/quotation/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างใบเสนอราคา
                    </Button>
                </Link>
            </h1>
            <DateRangePickerSearchParams />
            {children}
        </>
    )
}
