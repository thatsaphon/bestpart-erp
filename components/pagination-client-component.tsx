import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

type Props = {
    page: number
    limit: number
    numberOfPage: number
    onPageClick: (page: number) => void
}

export default function PaginationClientComponent({
    page,
    limit,
    numberOfPage,
    onPageClick,
}: Props) {
    return (
        <Pagination className="mt-4">
            {numberOfPage === 1 ? null : (
                <PaginationContent>
                    {page !== 1 && (
                        <PaginationItem>
                            <PaginationPrevious
                                type="button"
                                onClick={() => onPageClick(+page - 1)}
                            />
                        </PaginationItem>
                    )}
                    {Array.from({
                        length: numberOfPage,
                    }).map((_, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                isActive={+page === index + 1}
                                type="button"
                                // href={`?page=${index + 1}&limit=${limit}`}
                                onClick={() => onPageClick(index + 1)}
                            >
                                {index + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {page !== numberOfPage && (
                        <PaginationItem>
                            <PaginationNext
                                type="button"
                                onClick={() => onPageClick(+page + 1)}
                            />
                        </PaginationItem>
                    )}
                </PaginationContent>
            )}
        </Pagination>
    )
}
