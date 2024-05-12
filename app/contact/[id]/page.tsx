import { getContactDetail } from '@/app/actions/contact/getContactDetail'
import prisma from '@/app/db/db'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Pencil1Icon } from '@radix-ui/react-icons'
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
                {contact.Address.map((address) => (
                    <Card
                        key={`${address.id}-${address.updatedAt}`}
                        className="my-2 w-[350px]"
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-[600]">
                                <span>{address.name}</span>
                                <EditAddressDialog
                                    address={address}
                                    contact={contact}
                                />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{address.addressLine1}</p>
                            <p>{address.addressLine2}</p>
                            <p>{address.addressLine3}</p>
                            <p>{address.phone}</p>
                            <p>{address.taxId}</p>
                        </CardContent>
                        <CardFooter>
                            {address.isMain && (
                                <Badge variant={'outline'}>ที่อยู่หลัก</Badge>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                <Card className="my-2 flex w-[350px] items-center justify-center">
                    <EditAddressDialog contact={contact} />
                </Card>
            </div>
        </div>
    )
}
