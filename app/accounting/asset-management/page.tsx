import prisma from '@/app/db/db'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { fullDateFormat } from '@/lib/date-format'
import { AssetType } from '@prisma/client'
import React from 'react'

type Props = {}

export default async function AssetManagementPage({}: Props) {
    // AssetType
    const assets = await prisma.assetRegistration.findMany({
        include: {
            AssetMovement: {
                include: {
                    Document: true,
                },
            },
            AssetRegistrationDocument: true,
        },
    })

    return (
        <main className="h-full w-full p-3">
            <h1 className="mb-3 text-3xl font-bold">Asset Management</h1>

            <div className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full max-w-[700px]"
                >
                    {Object.entries(AssetType).map(([key, value]) => (
                        <AccordionItem key={key} value={key}>
                            <AccordionTrigger>
                                {key.replaceAll('_', ' ')}
                            </AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableCaption></TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Useful Life</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assets
                                            .filter((asset) => {
                                                return asset.type === value
                                            })
                                            .map((asset) => (
                                                <TableRow key={asset.id}>
                                                    <TableCell>
                                                        {asset.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {asset.description}
                                                    </TableCell>
                                                    <TableCell>
                                                        {asset.AssetMovement.find(
                                                            (movement) =>
                                                                movement.value >
                                                                0
                                                        )?.value.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {fullDateFormat(
                                                            asset.acquisitionDate
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {asset.usefulLife}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </main>
    )
}
