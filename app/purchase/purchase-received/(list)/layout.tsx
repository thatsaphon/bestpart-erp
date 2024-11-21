import DateRangePickerSearchParams from '@/components/date-range-picker-search-params'
import SubMenuNavLink from '@/components/submenu-navlink'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Purchase',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <h1 className="flex items-center gap-2 text-3xl text-primary">
                <span>งานซื้อสินค้า</span>
                <Link href={'/purchase/purchase-received/create'}>
                    <Button className="ml-3" variant={'outline'}>
                        สร้างบิลซื้อ
                    </Button>
                </Link>
            </h1>
            <DateRangePickerSearchParams />
            {children}
        </>
    )
}
