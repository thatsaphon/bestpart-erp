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
import { AssetType } from '@prisma/client'
import React from 'react'

type Props = {}

export default function AssetManagementPage({}: Props) {
    AssetType

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
                            <AccordionTrigger>{key}</AccordionTrigger>
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
                                    <TableBody></TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </main>
    )
}
