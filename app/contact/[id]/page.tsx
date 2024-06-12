import { getContactDetail } from '@/app/actions/contact/getContactDetail'
import EditAddressDialog from '@/components/edit-address-dialog'
import EditContactDialog from '@/components/edit-contact-dialog'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import React from 'react'

type Props = { params: { id: string } }

export default async function ContactDetailPage({ params: { id } }: Props) {
    const contact = await getContactDetail(id)

    if (!contact) return <>Contact not found</>

    return (
        <div className="mb-2 p-3">
            <h1 className="flex items-center gap-2 text-xl font-[600]">
                ผู้ติดต่อ - {contact.name}
                {contact.isAr && <Badge variant={'outline'}>ลูกค้า</Badge>}
                {contact.isAp && <Badge variant={'outline'}>คู่ค้า</Badge>}
                <EditContactDialog contact={contact} />
            </h1>

            <p>คำค้นหา: {contact.searchKeyword}</p>
            {contact.credit && <Badge>สามารถขายเชื่อได้</Badge>}

            <h3 className="mb-1 mt-3 text-lg font-[600]">ที่อยู่</h3>
            <Separator />
            <div className="flex flex-wrap items-stretch gap-2">
                <Card
                    key={`${contact.id}-${contact.updatedAt}`}
                    className="my-2 w-[350px]"
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-[600]">
                            <span>{contact.name}</span>
                            <EditAddressDialog contact={contact} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{contact.address}</p>
                        <p>{contact.phone}</p>
                        <p>{contact.taxId}</p>
                    </CardContent>
                    <CardFooter>
                        <p>{contact.searchKeyword}</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
