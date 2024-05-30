import React from 'react'
import { URLSearchParams } from 'url'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

type Props = {
    numberOfPage: number
    searchParams: {
        page?: string
        limit?: string
        search?: string
        remaining?: 'true' | 'false' | ''
    }
}

export default function PaginationInventory({
    numberOfPage,
    searchParams,
    searchParams: { page = '1', limit, search },
}: Props) {
    return (
        <Pagination>
            <PaginationContent>
                {page !== '1' && (
                    <PaginationItem key={1}>
                        <PaginationPrevious
                            href={`?${new URLSearchParams({
                                ...searchParams,
                                page: String(+page - 1),
                            }).toString()}`}
                        />
                    </PaginationItem>
                )}
                <PaginationItem key={'previous'}>
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
                    <PaginationItem key={'previous-ellipsis'}>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                {Array.from({ length: numberOfPage }).map((i, index) =>
                    index !== 0 && index > +page - 4 && index < +page + 3 ? (
                        <PaginationItem key={index + 1}>
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
                {/* {+page !== numberOfPage ||
                (+page < numberOfPage - 2 && (
                ))} */}
                {+page === numberOfPage ? (
                    <></>
                ) : +page > numberOfPage - 3 ? (
                    <></>
                ) : (
                    <PaginationItem key={'next-ellipsis'}>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                {+page !== numberOfPage && (
                    <PaginationItem key={'next'}>
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
    )
}
