import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableCaption,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import prisma from '../db/db'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import AddNewKnowledgeForm from './add-new-knowledge-form'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import UpdateKnowledgeForm from './update-knowledge-form'
import DeleteAlert from './delete-alert'
import { Metadata } from 'next'
import UpdateKnowledgeDialog from './update-knowledge-dialog'
import { Knowledge, KnowledgeImage } from '@prisma/client'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'จ.สุพรรณบุรีอะไหล่',
    description: 'บันทึก ค้นหา ข้อมูลเกี่ยวกับอะไหล่รถยนต์',
}

type Props = {
    searchParams: {
        page: string
        q: string
    }
}

export default async function page({
    searchParams,
    searchParams: { q = '', page = '1' },
}: Props) {
    let data = await prisma.knowledge.findMany({
        where: {
            AND: [
                ...q
                    .split(' ')
                    .filter((splited) => splited)
                    .map(
                        (splited) =>
                            ({
                                OR: [
                                    {
                                        content: {
                                            contains: splited,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            }) as unknown as {
                                OR: { content: { contains: string } }[]
                            }
                    ),
            ],
        },
        include: { KnowledgeImage: true },
        skip: (+page - 1) * 50,
        take: 50,
        orderBy: [{ createdAt: 'asc' }],
    })

    const count = await prisma.knowledge.count({
        where: {
            AND: [
                ...q
                    .split(' ')
                    .filter((splited) => splited)
                    .map(
                        (splited) =>
                            ({
                                OR: [
                                    {
                                        content: {
                                            contains: splited,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            }) as unknown as {
                                OR: { content: { contains: string } }[]
                            }
                    ),
            ],
        },
    })

    const numberOfPage = Math.ceil(count / 50)

    return (
        <main className="flex flex-col gap-2 p-1 lg:min-h-screen lg:p-24">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>เพิ่ม</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>เพิ่ม</DialogTitle>
                    </DialogHeader>

                    <AddNewKnowledgeForm />
                </DialogContent>
            </Dialog>
            <form className="flex flex-col gap-2 md:flex-row">
                <Input name="q" type="search" defaultValue={q} />
                <Button>Search</Button>
            </form>
            <Table>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            {item.KnowledgeImage?.length === 0 && (
                                <TableCell>{item.content}</TableCell>
                            )}
                            {item.KnowledgeImage?.length > 0 && (
                                <TableCell>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={item.content}>
                                            <AccordionTrigger>
                                                {item.content}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {item.KnowledgeImage?.map(
                                                        (image) => (
                                                            <Image
                                                                key={image.id}
                                                                src={image.path}
                                                                alt={`knowledge-${item.content}-${image.id}`}
                                                                width={250}
                                                                height={250}
                                                                unoptimized
                                                                className="max-h-[300px]"
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </TableCell>
                            )}
                            <TableCell className="w-[100px] text-right">
                                <UpdateKnowledgeDialog knowledge={item} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableCaption>
                    <Pagination>
                        <PaginationContent>
                            {page !== '1' && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`?${new URLSearchParams({
                                            ...searchParams,
                                            page: String(+page - 1),
                                        }).toString()}`}
                                    />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink
                                    href={`?${new URLSearchParams({
                                        ...searchParams,
                                        page: '1',
                                    }).toString()}`}
                                    isActive={+page === 1}
                                >
                                    1
                                </PaginationLink>
                            </PaginationItem>
                            {+page === 1 ? (
                                <></>
                            ) : +page <= 4 ? (
                                <></>
                            ) : (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            {Array.from({ length: numberOfPage }).map(
                                (i, index) =>
                                    index !== 0 &&
                                    index > +page - 4 &&
                                    index < +page + 3 ? (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={`?${new URLSearchParams({
                                                    ...searchParams,
                                                    page: index + 1 + '',
                                                }).toString()}`}
                                                isActive={+page === index + 1}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ) : (
                                        <></>
                                    )
                            )}
                            {+page === numberOfPage ? (
                                <></>
                            ) : +page > numberOfPage - 3 ? (
                                <></>
                            ) : (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            {+page !== numberOfPage && (
                                <PaginationItem>
                                    <PaginationNext
                                        href={`?${new URLSearchParams({
                                            ...searchParams,
                                            page: String(+page + 1),
                                        }).toString()}`}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                    <p>Total Page: {numberOfPage}</p>
                </TableCaption>
            </Table>
        </main>
    )
}
