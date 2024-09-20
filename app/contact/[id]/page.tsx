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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fullDateFormat } from '@/lib/date-format'
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
            <Separator />

            {/* <h3 className="mb-1 mt-3 text-lg font-[600]">ที่อยู่</h3> */}
            <Tabs defaultValue="address">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="address">ที่อยู่</TabsTrigger>
                    <TabsTrigger value="history">ประวัติ</TabsTrigger>
                </TabsList>
                <TabsContent value="address">
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
                </TabsContent>
                <TabsContent value="history">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>วันที่</TableHead>
                                <TableHead>เลขที่เอกสาร</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>สินค้า</TableHead>
                                <TableHead>จำนวน</TableHead>
                                <TableHead>หน่วย</TableHead>
                                <TableHead>ราคาต่อหน่วย</TableHead>
                                <TableHead>จำนวนเงิน</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contact.StockMovement.map((stockMovement) => (
                                <TableRow
                                    key={
                                        stockMovement.skuMasterId +
                                        '-' +
                                        stockMovement.documentId
                                    }
                                >
                                    <TableCell>
                                        {fullDateFormat(stockMovement.date)}
                                    </TableCell>
                                    <TableCell>
                                        {stockMovement.documentNo}
                                    </TableCell>
                                    <TableCell>
                                        {stockMovement.Document.type}
                                    </TableCell>
                                    <TableCell>
                                        {stockMovement.SkuMaster.MainSku.name +
                                            '-' +
                                            stockMovement.SkuMaster.detail}
                                    </TableCell>
                                    <TableCell>
                                        {`${stockMovement.quantity}`}
                                    </TableCell>
                                    <TableCell>
                                        {`${stockMovement.unit}(${
                                            stockMovement.quantityPerUnit
                                        })`}
                                    </TableCell>
                                    <TableCell>
                                        {`${stockMovement.pricePerUnit || stockMovement.costPerUnit}`}
                                    </TableCell>
                                    <TableCell>
                                        {stockMovement.quantity *
                                            (stockMovement.pricePerUnit ||
                                                stockMovement.costPerUnit)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    )
}
